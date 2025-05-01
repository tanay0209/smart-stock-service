import z from "zod"

export const vendorSchema = z.object({
    name: z.string().min(3, "Min 3 characters"),
    storeId: z.string().cuid()
})

export const deleteVendorSchema = z.object({
    vendorId: z.string().cuid(),
    storeId: z.string().cuid()
})