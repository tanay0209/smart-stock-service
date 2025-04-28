import z from "zod"


export const customerSchema = z.object({
    name: z.string().min(5, "Customer name is required"),
    storeId: z.string().cuid()
})

export const updateCustomerSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    storeId: z.string().cuid()
})

export const removeCustomerSchema = z.object({
    customerId: z.string().cuid(),
    storeId: z.string().cuid()
})