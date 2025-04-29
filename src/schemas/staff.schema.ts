import z from "zod"

export const staffSchema = z.object({
    staffId: z.string().cuid(),
    storeId: z.string().cuid(),
    role: z.enum(["OWNER", "MANAGER", "STAFF"])
})

export const removeStaffSchema = z.object({
    staffId: z.string().cuid(),
    storeId: z.string().cuid()
})