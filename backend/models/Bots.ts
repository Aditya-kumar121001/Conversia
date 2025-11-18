import mongoose, {Schema, Document, Types} from "mongoose";

export interface AppearanceSettings {
    themeColor?: string;
    fontSize?: string;
    logoUrl?: string;
}

export interface Bot extends Document {
    botId: Types.ObjectId;
    domainId: String;
    botType: "voice" | "chat";
    systemPrompt: Text;
    firstMessage: Text;
    appearance_settings: AppearanceSettings;
    language: Text;
    createdAt: Date;
    updatedAt: Date;
}

const botSchema = new Schema<Bot>(
    {
        botId: {type: mongoose.Schema.Types.ObjectId, required: true},
        domainId: {type: mongoose.Schema.Types.ObjectId, ref: "Domain", required: true},
        botType: {type: String, required:true},
        systemPrompt: {type: String},
        firstMessage: {type: String},
        appearance_settings: {type: Object},
        language: {type: String},
    },
    {timestamps: true}
);

export const Bot = mongoose.model<Bot>("Bot", botSchema);