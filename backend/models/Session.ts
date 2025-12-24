import mongoose, { Schema, Document } from 'mongoose'

export interface Session extends Document {
    visitorId: string,
    domain: string,
    createdAt: Date,
    expiredAt: Date
}

const sessionSchema = new Schema<Session>(
    {
        visitorId: [{type: String, required: true}],
        domain: [{type: String, required: true}],
        createdAt: [{type: Date, required: true}],
        expiredAt: [{type: Date, required: true}],
    }
)

export const Session = mongoose.model<Session>("Session", sessionSchema);