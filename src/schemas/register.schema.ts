import z from "zod"
export const registerSchema = z.object({
    username: z.string().min(3, "Username should be min 3 characters"),
    password: z.string().min(5, "Password should be min 5 characters").optional(),
    email: z.string().email("Invalid email")
})