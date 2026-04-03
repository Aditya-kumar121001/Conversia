import { GoogleGenAI } from "@google/genai";

const aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI });

export type ExecutionContext = Record<string, any>;

export async function executeTriggerNode(node: any, ctx: ExecutionContext) {
    // Trigger nodes don't "run" — they are the entry point.
    // Just pass through the triggering payload (e.g. the conversation doc)
    console.log(`[TRIGGER] ${node.id} fired`);
    return ctx; // ctx already has the conversation payload
}

export async function executeAIExtractNode(node: any, ctx: ExecutionContext) {
    const { schema, inputField, prompt } = node.nodeData.metadata;

    const getByPath = (obj: any, path: string) => {
        if (!path) return undefined;
        const parts = path.split(".");
        let cur: any = obj;
        for (const part of parts) {
            if (cur == null) return undefined;
            cur = cur[part];
        }
        return cur;
    };

    // Resolve value by preferred path, then fallbacks
    const candidates = [
        inputField,
        `conversation.${inputField}`,
        "conversation.text",
        "conversation.message",
        "conversation.content",
        "text",
        "message",
        "content",
    ].filter(Boolean) as string[];

    let inputValue: any;
    for (const p of candidates) {
        inputValue = getByPath(ctx, p);
        if (inputValue !== undefined && inputValue !== null) break;
    }

    if (inputValue === undefined || inputValue === null) {
        throw new Error(
            `AI Extract: inputField "${inputField}" not found. Tried: ${candidates.join(", ")}`,
        );
    }

    const schemaDescription = JSON.stringify(schema, null, 2);

    const fullPrompt = `
        ${prompt}
        
        Extract the following fields as JSON: ${schemaDescription}
        
        Input: "${inputValue}"
        
        Respond ONLY with valid JSON. No explanation.
    `;

    const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
    });

    const raw = response.text?.replace(/```json|```/g, "").trim() ?? "{}";
    const extracted = JSON.parse(raw);

    console.log(`[AI EXTRACT] ${node.id}:`, extracted);

    // Merge extracted fields into context
    return { ...ctx, ...extracted };
}

export async function executeSendMessageNode(node: any, ctx: ExecutionContext) {
    const { channel, to, subject, template } = node.nodeData.metadata;

    // Template supports variable interpolation from context
    // e.g. "Hello {{intent}}" → "Hello booking"
    const rendered = template.replace(/\{\{(\w+)\}\}/g, (_: any, key: string) => {
        return ctx[key] ?? `{{${key}}}`;
    });

    console.log(`[SEND MESSAGE] channel=${channel}, to=${to}`);
    console.log(`[SEND MESSAGE] rendered:`, rendered);

    // TODO: plug in your actual email/SMS/chat sender here
    // await sendEmail({ to, subject, body: rendered });
    // await sendChatReply({ conversationId: ctx.conversationId, text: rendered });

    return { ...ctx, lastMessage: rendered };
}

export async function executeDelayNode(node: any, ctx: ExecutionContext) {
    const delayMsRaw = node?.nodeData?.metadata?.delayMs;
    const delayMs = Number(delayMsRaw);
    if (!Number.isFinite(delayMs) || delayMs < 0) {
        throw new Error(`Delay: invalid delayMs "${String(delayMsRaw)}"`);
    }

    console.log(`[DELAY] ${node.id}: ${delayMs}ms`);
    await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    return ctx;
}

export async function executeSendReplyNode(node: any, ctx: ExecutionContext) {
    // Minimal no-op reply node until wired to a real chat transport.
    const template = String(node?.nodeData?.metadata?.template ?? "");
    if (!template) {
        console.log(`[SEND REPLY] ${node.id}: no template, skipping`);
        return ctx;
    }

    const rendered = template.replace(/\{\{(\w+)\}\}/g, (_: any, key: string) => {
        return ctx[key] ?? `{{${key}}}`;
    });

    console.log(`[SEND REPLY] ${node.id}:`, rendered);
    return { ...ctx, lastReply: rendered };
}