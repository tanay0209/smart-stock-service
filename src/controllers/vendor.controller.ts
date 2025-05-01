import { Response } from "express";
import { AuthRequest } from "../lib/auth-request.js";
import { sendError, sendSuccess } from "../lib/api-response.js";
import { deleteVendorSchema, vendorSchema } from "../schemas/vendor.schema.js";
import prisma from "../lib/prisma.js"


export const createVendor = async (request: AuthRequest, response: Response) => {
    try {
        const userId = request.user?.id!
        const data = request.body

        const validatedData = vendorSchema.safeParse(data)
        if (!validatedData.success) {
            return sendError(response, validatedData.error.errors[0].message, 400)
        }

        const { name, storeId } = validatedData.data

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
            return sendError(response, "Store not found", 404)
        }

        if (store.createdByUserId !== userId) {
            return sendError(response, "Owner can add vendors", 403)
        }

        const vendor = await prisma.vendor.create({
            data: {
                name,
                shopId: storeId,
            },
            select: {
                id: true,
                name: true,
                createdAt: true
            }
        })
        return sendSuccess(response, vendor, "Vendor created", 201)
    } catch (error) {
        console.error("Create vendor controller", error);
        return sendError(response, "Something went wrong")
    }
}

export const deleteVendor = async (request: AuthRequest, response: Response) => {
    try {
        const userId = request.user?.id!
        const data = request.body

        const validatedData = deleteVendorSchema.safeParse(data)
        if (!validatedData.success) {
            return sendError(response, validatedData.error.errors[0].message, 400)
        }

        const { vendorId, storeId } = validatedData.data

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
            return sendError(response, "Store not found", 404)
        }

        if (store.createdByUserId !== userId) {
            return sendError(response, "Owner can delete vendors", 403)
        }

        const vendor = await prisma.vendor.findFirst({
            where: {
                id: vendorId,
                shopId: storeId,
            }
        })

        if (!vendor) {
            return sendError(response, "Vendor not found", 404)
        }

        await prisma.vendor.delete({
            where: {
                id: vendorId,
                shopId: storeId
            }
        })
        return sendSuccess(response, vendorId, "Vendor deleted", 200)
    } catch (error) {
        console.error("Delete vendor controller", error);
        return sendError(response, "Something went wrong")
    }
}

export const updateVendor = async (request: AuthRequest, response: Response) => {
    try {
        const userId = request.user?.id!
        const data = request.body
        const vendorId = request.params.id

        if (!vendorId) {
            return sendError(response, "Vendor id is required", 400)
        }

        const validatedData = vendorSchema.safeParse(data)
        if (!validatedData.success) {
            return sendError(response, validatedData.error.errors[0].message, 400)
        }

        const { name, storeId } = validatedData.data

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
            return sendError(response, "Store not found", 404)
        }

        if (store.createdByUserId !== userId) {
            return sendError(response, "Owner can edit vendors", 403)
        }

        const vendor = await prisma.vendor.findFirst({
            where: {
                id: vendorId,
                shopId: storeId,
            },
            select: {
                id: true,
                name: true,
                createdAt: true
            }
        })

        if (!vendor) {
            return sendError(response, "Vendor not found", 404)
        }

        const updatedVendor = await prisma.vendor.update({
            where: {
                id: vendorId,
                shopId: storeId
            },
            data: {
                name
            },
            select: {
                id: true,
                name: true,
                createdAt: true
            }
        })

        return sendSuccess(response, updatedVendor, "Vendor updated", 200)
    } catch (error) {
        console.error("Update vendor controller", error);
        return sendError(response, "Something went wrong")
    }
}

export const getVendors = async (request: AuthRequest, response: Response) => {
    try {
        const userId = request.user?.id!
        const data = request.body

        const storeId = request.params.id
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
            return sendError(response, "Store not found", 404)
        }

        if (store.createdByUserId !== userId) {
            return sendError(response, "Owner can see vendors", 403)
        }

        const vendors = await prisma.vendor.findMany({
            where: {
                shopId: storeId,
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
            }
        })
        return sendSuccess(response, vendors, "Vendors fetched", 200)
    } catch (error) {
        console.error("Create vendor controller", error);
        return sendError(response, "Something went wrong")
    }
}