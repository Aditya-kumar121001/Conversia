import { Workflow } from "../models/Workflow";
import { Execution } from "../models/Execution";
import { Node } from "../models/Workflow";
import { getOrderedNodes } from "../utils";
import { routeNode } from "./nodeRouter";
import { ExecutionContext } from "./nodeExecutor";

export async function executeWorkflow(
    workflowId: string,
    triggerPayload: any,
    executionId?: string,
    options?: { force?: boolean },
) {
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) throw new Error("Workflow not found");
    if (workflow.workflowStatus !== "ACTIVE" && !options?.force) {
        console.log(`Workflow ${workflowId} is not active, skipping.`);
        return;
    }

    // Load or create an execution record to track this run
    const execution = executionId
        ? await Execution.findById(executionId)
        : await Execution.create({
            workflowId: workflow._id,
            userId: workflow.userId,
            status: "RUNNING",
            startedAt: new Date(),
            steps: [],
        });

    if (!execution) {
        throw new Error("Execution not found");
    }

    // Order the nodes by graph traversal
    const orderedNodes = getOrderedNodes(workflow.nodes as any[], workflow.edges as any[]);

    const isObjectIdLike = (value: unknown) => {
        const s = String(value ?? "");
        return /^[0-9a-fA-F]{24}$/.test(s);
    };

    // Resolve legacy node keys from Node collection (NodeType catalog _id → key)
    const legacyTypeIds = orderedNodes
        .map((n: any) => n?.NodeType)
        .filter((t: any) => t !== undefined && t !== null)
        .map((t: any) => String(t))
        .filter((t: string) => isObjectIdLike(t));

    const nodeKeyMap: Record<string, string> = {};
    if (legacyTypeIds.length) {
        const nodeDefs = await Node.find({ _id: { $in: legacyTypeIds } });
        for (const def of nodeDefs) {
            nodeKeyMap[def._id.toString()] = def.key;
        }
    }

    // Execution context flows between nodes
    let ctx: ExecutionContext = {
        workflowId,
        executionId: execution._id.toString(),
        conversation: triggerPayload, // initial payload from trigger
        ...triggerPayload,
    };

    for (const node of orderedNodes) {
        const rawType = (node as any)?.NodeType;
        const rawTypeStr = rawType === undefined || rawType === null ? "" : String(rawType);

        // Prefer NodeType as key (new workflows).
        // Fallback to mapping legacy catalog _id → key.
        const nodeKey = rawTypeStr.includes(".") ? rawTypeStr : (nodeKeyMap[rawTypeStr] ?? rawTypeStr);
        const stepStart = Date.now();

        try {
            console.log(`Executing node: ${node.id} (${nodeKey})`);
            ctx = await routeNode(node, nodeKey, ctx);

            // Record step success
            execution.steps.push({
                nodeId: node.id,
                nodeKey,
                status: "SUCCESS",
                output: ctx,
                durationMs: Date.now() - stepStart,
            });

        } catch (err: any) {
            console.error(`Node ${node.id} failed:`, err.message);

            execution.steps.push({
                nodeId: node.id,
                nodeKey,
                status: "FAILED",
                error: err.message,
                durationMs: Date.now() - stepStart,
            });

            // Mark execution failed and stop
            execution.status = "FAILED";
            await execution.save();
            return;
        }
    }

    execution.status = "COMPLETED";
    execution.completedAt = new Date();
    await execution.save();

    console.log(`Workflow ${workflowId} completed successfully.`);
}