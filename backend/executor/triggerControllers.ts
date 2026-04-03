// controllers/triggerControllers.ts
import { Workflow } from "../models/Workflow";
import { executeWorkflow } from "./workflowExecutor";

export async function handleConversationTrigger(conversation: any) {
    const domainId = conversation?.domainId ?? conversation?.metadata?.domain;

    // Find all ACTIVE workflows for this domain with a matching trigger
    const workflows = await Workflow.find({
        domain: conversation.domain, // or use domainId
        workflowStatus: "ACTIVE",
    });

    for (const workflow of workflows) {
        const triggerNode = (workflow.nodes as any[]).find(
            n => n.nodeData?.kind === "TRIGGER"
        );
        if (!triggerNode) continue;

        // Fire and forget — don't await in the watcher hot path
        executeWorkflow(workflow._id.toString(), conversation).catch(err =>
            console.error(`Workflow ${workflow._id} execution failed:`, err)
        );
    }
}