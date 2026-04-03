import {
    executeTriggerNode,
    executeAIExtractNode,
    executeSendMessageNode,
    executeDelayNode,
    executeSendReplyNode,
    ExecutionContext,
} from "./nodeExecutor";

// Map node keys → executor functions
// These keys should match what's stored in your Node collection
const NODE_EXECUTORS: Record<string, (node: any, ctx: ExecutionContext) => Promise<ExecutionContext>> = {
    "conversia.conversation.trigger": executeTriggerNode,
    "conversia.conversation.completed": executeTriggerNode,

    "conversia.ai.extract": executeAIExtractNode,
    "conversia.comm.send": executeSendMessageNode,

    "conversia.logic.delay": executeDelayNode,
    "conversia.action.reply": executeSendReplyNode,
};

export async function routeNode(node: any, nodeKey: string, ctx: ExecutionContext) {
    const executor = NODE_EXECUTORS[nodeKey];
    if (!executor) throw new Error(`No executor registered for node key: ${nodeKey}`);
    return executor(node, ctx);
}