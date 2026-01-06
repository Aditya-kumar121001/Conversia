import mongoose, { Schema, Document } from "mongoose";

export interface KnowledgeBase extends Document {
  sourceId: string;
  title: string;
  content: string;
  embedding: number[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  lastUsedAt?: Date;
}

export interface File extends Document {
    userId: mongoose.Types.ObjectId;
    filename: string;
    mimetype: string;
    size: number;
    storagePath: string; //S3 file path
    status: "uploaded" | "processed" | "failed";
    createdAt: Date;
}

const knowledgeBaseSchema = new Schema<KnowledgeBase>(
  {
    sourceId: {
      type: String,
      ref: "KnowledgeSource",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    embedding: {
      type: [Number],
      required: true,
    },

    tags: {
      type: [String],
      default: [],
      index: true,
    },

    usageCount: {
      type: Number,
      default: 0,
    },

    lastUsedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);


export const KnowledgeEntryModel = mongoose.model<KnowledgeBase>(
  "KB",
  knowledgeBaseSchema
);
