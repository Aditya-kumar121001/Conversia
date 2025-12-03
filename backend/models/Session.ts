import mongoose, { Schema } from 'mongoose'

export interface Session extends Document {
    visitorId: string,
    domain: string,
    createdAt: Date,
    updatedAt: Date
}

const sessionSchema = new Schema<Session>(
    {
        visitorId: [{type: String, required: true}],
        domain: [{type: String, required: true}],
    },
    {timestamps: true}
)

export const Session = mongoose.model<Session>("Session", sessionSchema);