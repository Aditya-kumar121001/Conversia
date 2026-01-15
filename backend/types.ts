import z, { number } from 'zod'
import { ObjectId } from 'mongodb'

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
}

export interface BotContextData {
    chatbotName?: string;
    fallbackMessage?: string;
    conversationStarters?: string[];
    files?: string[]; // Knowledge base file IDs
    tone?: "Friendly" | "Professional" | "Playful" | "Formal";
    aiModel?: string;
}