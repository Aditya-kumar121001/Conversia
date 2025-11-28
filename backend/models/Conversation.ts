import mongoose, {Schema, Document, Types} from 'mongoose'

export interface Conversation extends Document {
    createdAt: Date;
    updatedAt: Date;
    messages: Types.ObjectId[]
}

const conversationSchema = new Schema<Conversation>(
    {
        messages: [{ type: Schema.Types.ObjectId, ref: 'Message', required: true }],
    },
    {timestamps: true}
)

export const Conversation = mongoose.model<Conversation>("Conversation", conversationSchema);