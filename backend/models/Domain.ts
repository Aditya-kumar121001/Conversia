import mongoose, { Schema, Document } from 'mongoose';

export interface Domain extends Document {
    domainId: string;
    userId: mongoose.Types.ObjectId;
    domainName: string;
    createdAt: Date;
    updatedAt: Date;
}

const domainSchema = new Schema<Domain>(
    {
        userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
        domainId: { type: String, required: true },
        domainName: {type: String, required: true},
    },
    {timestamps: true}
);


domainSchema.index({ userId: 1 });
domainSchema.index({ domainId: 1 }, { unique: true });


export const Domain = mongoose.model<Domain>("Domain", domainSchema);