import mongoose, {Document, Schema} from 'mongoose'

export enum ExecutionStatus { 
    PENDING = "PENDING", 
    RUNNING = "RUNNING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
}

export interface Execution extends Document{
    domain: string;
    executionType: "chat" | "voice";
    executionStatus: ExecutionStatus;
    conversationId: mongoose.Types.ObjectId;
    startedAt: Date;
    completedAt: Date;
}

const executionSchema = new Schema<Execution>(
    {
        domain: {type: String, required: true},
        executionType: {type: String, required: true},
        executionStatus: {
            type: String,
            enum: Object.values(ExecutionStatus),
            required: true
        },
        conversationId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Conversation"
        },
        startedAt: {type: Date, required: true, default: Date.now},
        completedAt: {type: Date, default: null}
    },
    {timestamps: true}
)

export const Execution = mongoose.model<Execution>("Execution", executionSchema)  