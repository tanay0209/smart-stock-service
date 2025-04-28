import { Response } from "express";
import { sendError, sendSuccess } from "../lib/api-response.js";
import { AuthRequest } from "../lib/auth-request.js";
import { customerSchema, removeCustomerSchema, updateCustomerSchema } from "../schemas/customer.schema.js";
import prisma from "../lib/prisma.js";

export const createCustomer = async (request: AuthRequest, response: Response) => {
    try {
        const data = request.body
        const validatedData = customerSchema.safeParse(data)
        if (!validatedData.success) {
            return sendError(response, validatedData.error.errors[0].message, 400)
        }
        const { name, storeId } = validatedData.data
        const shop = await prisma.shop.findFirst({
            where: {
                id: storeId
            }
        })

        if (!shop) {
            return sendError(response, "No store found", 404)
        }
        await prisma.customer.create({
            data: {
                name,
                shopId: storeId
            }
        })
        return sendSuccess(response, null, "Customer created", 201)

    } catch (error) {
        console.error("Create Customer Controller", error);
        return sendError(response, "Something went wrong")
    }
}

export const updateCustomer = async (request: AuthRequest, response: Response) => {
    try {
        const userId = request.user?.id!
        const data = request.body
        const validatedData = updateCustomerSchema.safeParse(data)

        if (!validatedData.success) {
            return sendError(response, validatedData.error.errors[0].message, 400)
        }
        const { storeId, name, id } = validatedData.data
        const store = await prisma.shop.findFirst({
            where: {
                id: storeId,
                createdByUserId: userId,

            },
            select: {
                id: true,
                createdByUserId: true,
                customers: {
                    where: {
                        id
                    },
                    select: {
                        id: true
                    }
                }
            }
        })

        if (!store) {
            return sendError(response, "Store not found", 404)
        }
        if (store.createdByUserId !== userId) {
            return sendError(response, "Only owner can update customer details", 401)
        }

        if (store.customers.length === 0) {
            return sendError(response, "No customer found", 404)
        }

        const customer = await prisma.customer.update({
            where: {
                id: store.customers[0].id,
                shopId: storeId
            },
            data: {
                name
            },
            select: {
                id: true,
                name: true,
                shopId: true
            }
        })
        return sendSuccess(response, customer, "Customer updated", 200)

    } catch (error) {
        console.error("Update customer controller", error);
        return sendError(response, "Something went wrong")
    }
}

export const removeCustomer = async (request: AuthRequest, response: Response) => {
    try {
        const userId = request.user?.id!
        const data = request.body
        const validatedData = removeCustomerSchema.safeParse(data)
        if (!validatedData.success) {
            return sendError(response, validatedData.error.errors[0].message, 400)
        }

        const { customerId, storeId } = validatedData.data

        const existingStore = await prisma.shop.findFirst({
            where: {
                id: storeId,
            },
            select: {
                id: true,
                createdByUserId: true,
                customers: {
                    where: {
                        id: customerId
                    },
                    select: {
                        id: true
                    }
                }
            }
        })

        if (!existingStore) {
            return sendError(response, "No store found", 404)
        }

        if (existingStore.customers.length === 0) {
            return sendError(response, "No customer found", 404)
        }

        if (existingStore.createdByUserId !== userId) {
            return sendError(response, "Only owner can remove customers", 401)
        }

        await prisma.customer.delete({
            where: {
                id: customerId,
                shopId: storeId
            }
        })

        return sendSuccess(response, undefined, "Customer removed successfully", 200)

    } catch (error) {
        console.error("Remove customer controller", error);
        return sendError(response, "Something went wrong")
    }
}

export const getCustomer = async (request: AuthRequest, response: Response) => {
    try {
        const userId = request.user?.id!
        const { storeId, customerId } = request.query
        if (!storeId || !customerId) {
            return sendError(response, "Store id and Customer id is required")
        }
        const userOnShop = await prisma.userOnShop.findUnique({
            where: {
                userId_shopId: {
                    userId: userId,
                    shopId: storeId as string,
                },
            },
        });

        if (!userOnShop) {
            return sendError(response, "Cannot access this resource", 403);
        }

        const customer = await prisma.customer.findUnique({
            where: {
                id: customerId as string,
                shopId: storeId as string
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!customer) {
            return sendError(response, "Customer not found in this store", 404);
        }
        return sendSuccess(response, customer, "Customer details retrieved", 200);
    } catch (error) {
        console.error("Get customer controller", error);
        return sendError(response, "Something went wrong")
    }
}

export const getAllCustomers = async (request: AuthRequest, response: Response) => {
    try {
        const userId = request.user?.id!
        const storeId = request.params.storeId
        if (!storeId) {
            return sendError(response, "Store id is required")
        }
        const userOnShop = await prisma.userOnShop.findUnique({
            where: {
                userId_shopId: {
                    userId: userId,
                    shopId: storeId,
                },
            },
        });

        if (!userOnShop) {
            return sendError(response, "Cannot access this resource", 403);
        }

        const customers = await prisma.customer.findMany({
            where: {
                shopId: storeId
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (customers.length === 0) {
            return sendError(response, "No customers found", 404);
        }
        return sendSuccess(response, customers, "Customer details retrieved", 200);
    } catch (error) {
        console.error("Get all customer controller", error);
        return sendError(response, "Something went wrong")
    }
}