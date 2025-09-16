import mongoose, { Schema } from 'mongoose'

export interface Agent extends Document{
    userId: mongoose.Types.ObjectId;
    agentId: string;
    agentType: string;
    agentSubtype: string;
    createdAt: Date;
    updatedAt: Date;
}

const agentSchema = new Schema<Agent>(
    {
     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
     agentId: { type: String, required: true, unique: true },
     agentType: {type: String, required: true},
     agentSubtype: {type: String, required: true},
    },
    {timestamps: true}
);

export const Agent = mongoose.model<Agent>("Agent", agentSchema); 