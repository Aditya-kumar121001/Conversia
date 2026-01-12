import mongoose, { Schema, Document } from "mongoose";

export interface KnowledgeBase extends Document {
  userId: mongoose.Types.ObjectId;
  fileIds: mongoose.Types.ObjectId[];
  usageCount: number;
  createdAt: Date;
}

const knowledgeBaseSchema = new Schema<KnowledgeBase>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    fileIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "File",
      },
    ],

    usageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);


export interface File extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    fileName: string;
    fileType: string;
    size: number;
    storagePath: string; //S3 file path
    status: "Processing" | "Processed" | "Failed";
    createdAt: Date;
}

const FileSchema = new Schema<File>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    storagePath: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Processing", "Processed", "Failed"],
      default: "Processing",
    },
  },
  { timestamps: true }
);


export const KnowledgeBase = mongoose.model<KnowledgeBase>(
  "KB",
  knowledgeBaseSchema
);

export const File = mongoose.model<File>(
  "File",
  FileSchema
);
