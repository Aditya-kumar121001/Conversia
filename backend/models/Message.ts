import mongoose, { Schema, Document, Types } from 'mongoose';

export interface Message extends Document {
  conversationId: Types.ObjectId;
  role: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<Message>(
  {
    conversationId: {type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    role: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const Message = mongoose.model<Message>('Message', messageSchema);
