import z from 'zod'

export const CreateUser = z.object({
    email: z.email(),
    name: z.string()
})

export const Signin = z.object({
    email:z.email(),
    otp: z.string().or(z.number().int())
})

export interface UpdateBotSettingsRequest {
    botType?: "voice" | "chat";
    greeting?: string; // Maps to firstMessage
    appearance_settings?: {
        themeColor?: string;
        fontSize?: string;
        logoUrl?: string;
    };
    context?: string; // JSON string containing additional settings
    systemPrompt?: string;
    firstMessage?: string;
    language?: string;
    generalSettings?: {
        systemPrompt?: string;
        firstMessage?: string;
        fallbackMessage?: string;
        starters?: string[];
    };
    fallbackMessage?: string; // For convenience, can be set at top level
    starters?: string[]; // For convenience, can be set at top level
    // Selected KB file IDs for retrieval (File._id from KnowlodgeBase)
    kbFiles?: string[];
}

export interface BotContextData {
    chatbotName?: string;
    fallbackMessage?: string;
    conversationStarters?: string[];
    files?: string[]; // Knowledge base file IDs
    tone?: "Friendly" | "Professional" | "Playful" | "Formal";
    aiModel?: string;
    // Alias for files (optional)
    kbFiles?: string[];
}