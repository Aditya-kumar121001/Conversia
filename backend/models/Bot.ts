import mongoose, {Schema, Document, Types} from "mongoose";

export interface AppearanceSettings {
    themeColor?: string;
    fontSize?: string;
    logoUrl?: string;
}

export interface generalSettings {
    systemPrompt: string;
    firstMessage: string;
    fallbackMessage: string;
    starters: string[];
}

export interface Bot extends Document {
    domainId: string;
    domainName: string;
    botType: "voice" | "chat";
    generalSettings: generalSettings;
    appearance_settings: AppearanceSettings;
    language: string;
    context?: string;
    // KB File IDs (KnowlodgeBase File._id as strings) used for retrieval
    kbFiles?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const botSchema = new Schema<Bot>(
    {
        domainId: { type: String, ref: "Domain", required: true },
        domainName: { type: String, required: true },
        botType: { type: String, required: true },
        generalSettings: {
            type: {
                systemPrompt: { type: String, required: false, default: "" },
                firstMessage: { type: String, required: false, default: "" },
                fallbackMessage: { type: String, required: false, default: "" },
                starters: { type: [String], default: [] },
            },
            required: false,
            default: undefined,
        },
        appearance_settings: {
            type: {
                themeColor: { type: String, required: false, default: "#000000" },
                fontSize: { type: String, required: false, default: "14" },
                logoUrl: { type: String, required: false, default: "" }
            },
            required: false,
            default: undefined,
        },
        kbFiles: { type: [String], required: false, default: [] },
        language: { type: String, required: false, default: "en" },
    },
    {timestamps: true}
);

export const Bot = mongoose.model<Bot>("Bot", botSchema);