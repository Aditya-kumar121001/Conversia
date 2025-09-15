import z from 'zod'
import { ObjectId } from 'mongodb'

export const CreateUser = z.object({
    email: z.email()
})

export const Signin = z.object({
    email:z.email(),
    otp: z.string().or(z.number().int())
})
