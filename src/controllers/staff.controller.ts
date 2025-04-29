import { sendError, sendSuccess } from "../lib/api-response.js";
import { AuthRequest } from "../lib/auth-request.js";
import { removeStaffSchema, staffSchema } from "../schemas/staff.schema.js";
import prisma from "../lib/prisma.js"
import { Response } from "express";


export const createStaff = async (request: AuthRequest, response: Response) => {
    try {
        const userId = request.user?.id!
        const data = request.body
        const validatedData = staffSchema.safeParse(data)
        if (!validatedData.success) {
            return sendError(response, validatedData.error.errors[0].message, 400)
        }
        const { role, storeId, staffId } = validatedData.data
        const store = await prisma.shop.findFirst({
            where: {
                id: storeId
            },
            select: {
                id: true,
                createdByUserId: true
            }
        })

        if (!store) {
            return sendError(response, "No store found", 404)
        }
        if (store.createdByUserId !== userId) {
            return sendError(response, "Only owner can add staffs", 403)
        }

        const staff = await prisma.userOnShop.create({
            data: {
                shopId: storeId,
                userId: staffId,
                role
            },
            select: {
                id: true,
                role: true,
                shopId: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,

                    },

                }
            }
        })
        return sendSuccess(response, staff, "Staff added successfully", 201)
    } catch (error) {
        console.error("Create staff controller", error);
        return sendError(response, "Something went wrong")
    }
}

export const removeStaff = async (request: AuthRequest, response: Response) => {
    try {
        const userId = request.user?.id!
        const data = request.body
        const validatedData = removeStaffSchema.safeParse(data)
        if (!validatedData.success) {
            return sendError(response, validatedData.error.errors[0].message, 400)
        }
        const { storeId, staffId } = validatedData.data

        const store = await prisma.shop.findFirst({
            where: {
                id: storeId
            },
            select: {
                id: true,
                createdByUserId: true
            }
        })

        if (!store) {
            return sendError(response, "No store found", 404)
        }
        if (store.createdByUserId !== userId) {
            return sendError(response, "Only owner can remove staffs", 403)
        }

        const staff = await prisma.userOnShop.delete({
            where: {
                userId_shopId: {
                    userId: staffId,
                    shopId: storeId
                }
            }
        })
        return sendSuccess(response, staff.id, "Staff removed successfully", 200)
    } catch (error) {
        console.error("Remove staff controller", error);
        return sendError(response, "Something went wrong")
    }
}

export const updateStaff = async (request: AuthRequest, response: Response) => {
    try {
        const userId = request.user?.id!
        const data = request.body
        const validatedData = staffSchema.safeParse(data)
        if (!validatedData.success) {
            return sendError(response, validatedData.error.errors[0].message, 400)
        }
        const { role, storeId, staffId } = validatedData.data
        const store = await prisma.shop.findFirst({
            where: {
                id: storeId
            },
            select: {
                id: true,
                createdByUserId: true
            }
        })

        if (!store) {
            return sendError(response, "No store found", 404)
        }
        if (store.createdByUserId !== userId) {
            return sendError(response, "Only owner can update staff", 403)
        }

        const staff = await prisma.userOnShop.update({
            where: {
                userId_shopId: {
                    userId: staffId,
                    shopId: storeId
                }
            },
            data: {
                role
            },
            select: {
                id: true,
                role: true,
                shopId: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },

                }
            }
        })
        return sendSuccess(response, staff, "Staff updated successfully", 200)
    } catch (error) {
        console.error("Update staff controller", error);
        return sendError(response, "Something went wrong")
    }
}

export const getStaffsOfStore = async (request: AuthRequest, response: Response) => {
    try {
        const userId = request.user?.id!
        const storeId = request.params.storeId
        if (!storeId) {
            return sendError(response, "Store id is required", 400)
        }
        const store = await prisma.shop.findFirst({
            where: {
                id: storeId
            },
            select: {
                id: true,
                createdByUserId: true
            }
        })

        if (!store) {
            return sendError(response, "No store found", 404)
        }
        if (store.createdByUserId !== userId) {
            return sendError(response, "Only owner can fetch staff details", 403)
        }

        const staffs = await prisma.userOnShop.findMany({
            where: {
                shopId: storeId
            },
            select: {
                id: true,
                role: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                }
            }
        })
        return sendSuccess(response, staffs, "Staff fetched successfully", 201)
    } catch (error) {
        console.error("Get staffs controller", error);
        return sendError(response, "Something went wrong")
    }
}

