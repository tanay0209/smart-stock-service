import { Response } from "express";
import { sendError, sendSuccess } from "src/lib/api-response.js";
import { AuthRequest } from "src/lib/auth-request.js";
import { storeSchema } from "src/schemas/store.schema.js";
import prisma from "../lib/prisma"

export const createStore = async (request: AuthRequest, response: Response) => {
    try {
        const userId = request.user?.id!
        const data = request.body

        const validatedData = storeSchema.safeParse(data)

        if (!validatedData.success) {
            return sendError(response, validatedData.error.errors[0].message, 400)
        }

        const { name } = validatedData.data

        const existingShop = await prisma.shop.findFirst({
            where: {
                name,
                createdByUserId: userId
            }
        })

        if (existingShop) {
            return sendError(response, "Shop with this name already exists")
        }
        const shop = await prisma.shop.create({
            data: {
                name,
                createdByUserId: userId
            },
            select: {
                name: true,
                id: true,
                createdByUser: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        })
        return sendSuccess(response, shop, "Store created successfully", 201)
    } catch (error) {
        console.error("Create Store Controller", error);
        return sendError(response, "Something went wrong")
    }
}

export const deleteStore = async (request: AuthRequest, response: Response) => {
    try {
        const userId = request.user?.id!
        const shopId = request.params.id
        const shop = await prisma.shop.findUnique({
            where: {
                id: shopId,
            },
            select: {
                id: true,
                createdByUserId: true
            }
        })

        if (!shop) {
            return sendError(response, "Store not found", 404)
        }
        if (shop.createdByUserId !== userId) {
            return sendError(response, "Only owner can delete the store", 403)
        }
        await prisma.shop.delete({
            where: {
                id: shop.id
            }
        })
        return sendSuccess(response, shop.id, "Store deleted", 200)
    } catch (error) {
        console.error("Delete Shop controller", error);
        return sendError(response, "Something went wrong")
    }
}

export const updateStore = async (request: AuthRequest, response: Response) => {
    try {
        const userId = request.user?.id!
        const data = request.body
        const shopId = request.params.id
        const validatedData = storeSchema.safeParse(data)
        if (!validatedData.success) {
            return sendError(response, validatedData.error.errors[0].message, 400)
        }
        const { name } = validatedData.data
        const shop = await prisma.shop.findUnique({
            where: {
                id: shopId,
                createdByUserId: userId
            },
            select: {
                createdByUserId: true
            }
        })

        if (!shop) {
            return sendError(response, "Store not found")
        }

        if (shop.createdByUserId !== userId) {
            return sendError(response, "Only owner can update store")
        }

        const updatedShop = await prisma.shop.update({
            where: {
                id: shopId
            },
            data: {
                name
            },
            select: {
                id: true,
                name: true,
                createdByUserId: true
            }
        })
        return sendSuccess(response, { ...updatedShop }, "Store updated", 200)
    } catch (error) {
        console.error("Update Store Controller", error);
        return sendError(response, "Something went wrong")
    }
}

export const userOwnedStores = async (request: AuthRequest, response: Response) => {
    try {
        const userId = request.user?.id!

        const stores = await prisma.shop.findMany({
            where: {
                createdByUserId: userId
            },
            select: {
                id: true,
                name: true
            }
        })

        if (!stores) {
            return sendError(response, "No stores found", 404)
        }

        return sendSuccess(response, stores, "Stores retrieved", 200)
    } catch (error) {
        console.error("Shop Details controller", error);
        return sendError(response, "Something went wrong")
    }
}

export const storesAssociatedWithUser = async (request: AuthRequest, response: Response
) => {
    try {
        const userId = request.user?.id!;
        const shops = await prisma.shop.findMany({
            where: {
                users: {
                    some: {
                        userId: userId
                    }
                },
                createdByUserId: {
                    not: userId
                }
            },
            select: {
                id: true,
                name: true,
                createdByUser: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        });

        if (!shops.length) {
            return sendError(response, "No shops found where the user is associated", 404);
        }

        return sendSuccess(response, shops, "Shops where the user is associated but not the owner", 200);
    } catch (error) {
        console.error("Get Shops Associated But Not Owned by User Controller", error);
        return sendError(response, "Something went wrong");
    }
}