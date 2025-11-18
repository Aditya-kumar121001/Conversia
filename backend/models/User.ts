import mongoose, { Schema, Document, Types } from "mongoose";

export interface User extends Document {
  name: string
  email: string;
  credits: number;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
  subscriptions: Types.ObjectId[];
  paymentHistory: Types.ObjectId[];
}

const userSchema = new Schema<User>(
  {
    name:{ type: String, required: true},
    email: { type: String, required: true, unique: true },
    credits: { type: Number, default: 3 },
    isPremium: { type: Boolean, default: false },
    subscriptions: [{ type: Schema.Types.ObjectId, ref: "Subscription" }],
    paymentHistory: [{ type: Schema.Types.ObjectId, ref: "PaymentHistory" }],
  },
  { timestamps: true }
);

export const User = mongoose.model<User>("User", userSchema);
