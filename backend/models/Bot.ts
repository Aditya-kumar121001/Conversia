import mongoose, {Schema, Document, Types} from "mongoose";

export interface AppearanceSettings {
    themeColor?: string;
    fontSize?: string;
    logoUrl?: string;
}

export interface Bot extends Document {
    domainId: string;
    botType: "voice" | "chat";
    systemPrompt: string;
    firstMessage: string;
    appearance_settings: AppearanceSettings;
    language: string;
    context?: string;
    createdAt: Date;
    updatedAt: Date;
}

const botSchema = new Schema<Bot>(
    {
        domainId: {type: String, ref: "Domain", required: true},
        botType: {type: String, required:true},
        systemPrompt: {type: String},
        firstMessage: {type: String},
        appearance_settings: {type: Object},
        language: {type: String},
    },
    {timestamps: true}
);

export const Bot = mongoose.model<Bot>("Bot", botSchema);