import z from "zod"

export const categorySchema = z.object({
    name: z.string().min(3, "Min 3 char required"),
    description: z.string().min(3, "Min 3 characters required").optional(),
    userId: z.string().cuid()
})