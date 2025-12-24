import mongoose, { Schema, Document } from 'mongoose'

export interface Agent extends Document{
    userId: mongoose.Types.ObjectId;
    agentName: string;
    agentId: string;
    agentType: string;
    agentSubType: string;
    firstMessage: string;
    prompt: string;
    createdAt: Date;
    updatedAt: Date;
}

const agentSchema = new Schema<Agent>(
    {
     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
     agentName: {type: String, required: true},
     agentId: { type: String, required: true, unique: true },
     agentType: {type: String, required: true},
     agentSubType: {type: String, required: true},
     firstMessage: {type: String, required: true},
     prompt: {type: String, required: true},
    },
    {timestamps: true}
);

export const Agent = mongoose.model<Agent>("Agent", agentSchema); 