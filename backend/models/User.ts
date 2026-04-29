import mongoose, { Schema, Document, Types } from "mongoose";

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  title?: string;
  location?: string;
  phone?: string;
  bio?: string;
  country?: string;
  cityState?: string;
  postalCode?: string;
  taxId?: string;
}

export interface User extends Document {
  name: string
  email: string;
  credits: number;
  isPremium: boolean;
  plan: "free" | "premium";
  planExpiresAt?: Date;
  profile?: UserProfile;
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
    plan: { type: String, enum: ["free", "premium"], default: "free" },
    planExpiresAt: { type: Date, default: undefined },
    profile: {
      type: {
        firstName: { type: String, default: "" },
        lastName: { type: String, default: "" },
        title: { type: String, default: "" },
        location: { type: String, default: "" },
        phone: { type: String, default: "" },
        bio: { type: String, default: "" },
        country: { type: String, default: "" },
        cityState: { type: String, default: "" },
        postalCode: { type: String, default: "" },
        taxId: { type: String, default: "" },
      },
      required: false,
    },
    subscriptions: [{ type: Schema.Types.ObjectId, ref: "Subscription" }],
    paymentHistory: [{ type: Schema.Types.ObjectId, ref: "PaymentHistory" }],
  },
  { timestamps: true }
);

export const User = mongoose.model<User>("User", userSchema);
