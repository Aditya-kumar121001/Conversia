import mongoose, {Schema, Document, Types} from 'mongoose'

export interface Conversation extends Document {
    email: string,
    createdAt: Date;
    updatedAt: Date;
    messages: Types.ObjectId[]
}

const conversationSchema = new Schema<Conversation>(
    {
        email: [{type: String, required: true}],
        messages: [{ type: Schema.Types.ObjectId, ref: 'Message', required: true }],
    },
    {timestamps: false}
)

export const Conversation = mongoose.model<Conversation>("Conversation", conversationSchema);