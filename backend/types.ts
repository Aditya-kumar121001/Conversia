import z from 'zod'

export const CreateUser = z.object({
    email: z.email()
})