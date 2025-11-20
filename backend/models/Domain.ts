import mongoose, { Schema, Document } from 'mongoose';

export interface Domain extends Document {
    userId: mongoose.Types.ObjectId;
    domainId: string;
    domainName: string;
    domainUrl: string;
    domainImageUrl: string;
    createdAt: Date;
    updatedAt: Date;
}

const domainSchema = new Schema<Domain>(
    {
        userId: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
        domainId: { type: String, required: true },
        domainName: {type: String, required: true},
        domainUrl: {type: String, required: true},
        domainImageUrl: {type: String},
    },
    {timestamps: true}
);

domainSchema.index({ userId: 1, domainName: 1 }, { unique: true });
domainSchema.index({ userId: 1 });

export const Domain = mongoose.model<Domain>("Domain", domainSchema);