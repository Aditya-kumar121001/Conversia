import mongoose, { Schema, Document, Types } from "mongoose";

export interface Waitlist extends Document {
  email: string;
}

const waitlistSchema = new Schema<Waitlist>(
  {
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const Waitlist = mongoose.model<Waitlist>("Waitlist", waitlistSchema);
