import mongoose, { Schema, Document, Types } from "mongoose";

export interface User extends Document {
  email: string;
  credits: number;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
  agents?: Types.ObjectId[];
  executions: Types.ObjectId[];
  subscriptions: Types.ObjectId[];
  paymentHistory: Types.ObjectId[];
}

const userSchema = new Schema<User>(
  {
    email: { type: String, required: true, unique: true },
    credits: { type: Number, default: 3 },
    isPremium: { type: Boolean, default: false },
    // agents
    agents: [{ type: Schema.Types.ObjectId, ref: "Agent" }],
    executions: [{ type: Schema.Types.ObjectId, ref: "Execution" }],
    subscriptions: [{ type: Schema.Types.ObjectId, ref: "Subscription" }],
    paymentHistory: [{ type: Schema.Types.ObjectId, ref: "PaymentHistory" }],
  },
  { timestamps: true }
);

export const User = mongoose.model<User>("User", userSchema);
