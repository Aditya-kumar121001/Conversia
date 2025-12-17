import mongoose, { Schema, Document, Types } from "mongoose";

export enum ConversationStatus {
  OPEN = "OPEN",
  FINISHED = "FINISHED",
}

export interface ConversationDocument extends Document {
  email: string;
  domain: string;
  messages: Types.ObjectId[];
  status: ConversationStatus;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<ConversationDocument>(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },

    domain: {
      type: String,
      required: true,
      index: true,
    },

    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],

    status: {
      type: String,
      enum: Object.values(ConversationStatus),
      default: ConversationStatus.OPEN,
      index: true,
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

//allow multiple conversation per user and only one active conversation
conversationSchema.index(
    { email: 1, domain: 1, status: 1 },
    {
      unique: true,
      partialFilterExpression: { status: "OPEN" },
    }
  );

export const Conversation = mongoose.model<ConversationDocument>(
  "Conversation",
  conversationSchema
);
