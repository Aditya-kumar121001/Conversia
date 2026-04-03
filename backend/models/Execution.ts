import mongoose, { Document, Schema } from "mongoose";

export type ExecutionStep = {
    nodeId: string;
    nodeKey?: string;
    status: "SUCCESS" | "FAILED";
    output?: unknown;
    error?: string;
    durationMs?: number;
};

export interface Execution extends Document {
    workflowId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    status: "RUNNING" | "COMPLETED" | "FAILED";
    startedAt: Date;
    completedAt?: Date | null;
    steps: ExecutionStep[];
}

const executionSchema = new Schema<Execution>(
    {
        workflowId: { type: Schema.Types.ObjectId, required: true, ref: "Workflow" },
        userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
        status: {
            type: String,
            enum: ["RUNNING", "COMPLETED", "FAILED"],
            required: true,
        },
        startedAt: { type: Date, required: true, default: Date.now },
        completedAt: { type: Date, default: null },
        steps: [
            {
                nodeId: { type: String, required: true },
                nodeKey: { type: String },
                status: { type: String, enum: ["SUCCESS", "FAILED"], required: true },
                output: Schema.Types.Mixed,
                error: String,
                durationMs: Number,
            },
        ],
    },
    { timestamps: true },
);

export const Execution = mongoose.model<Execution>("Execution", executionSchema);