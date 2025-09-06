import mongoose, { Schema, Document } from "mongoose";

export interface User extends Document {
  email: string;
  credits: number;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
  executions: mongoose.Types.ObjectId[];
  subscriptions: mongoose.Types.ObjectId[];
  paymentHistory: mongoose.Types.ObjectId[];
}

const userSchema = new Schema<User>(
  {
    email: { type: String, required: true, unique: true },
    credits: { type: Number, default: 3 },
    isPremium: { type: Boolean, default: false },

    // Relations (arrays of ObjectId refs)
    executions: [{ type: Schema.Types.ObjectId, ref: "Execution" }],
    subscriptions: [{ type: Schema.Types.ObjectId, ref: "Subscription" }],
    paymentHistory: [{ type: Schema.Types.ObjectId, ref: "PaymentHistory" }],
  },
  { timestamps: true } // handles createdAt + updatedAt automatically
);

export const User = mongoose.model<User>("User", userSchema);
