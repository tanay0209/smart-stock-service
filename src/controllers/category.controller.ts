import { sendError, sendSuccess } from "../lib/api-response.js";
import { AuthRequest } from "../lib/auth-request.js";
import { categorySchema } from "../schemas/category.schema.js";
import prisma from "../lib/prisma";
import { Response } from "express";

export const createCategory = async (request: AuthRequest, response: Response) => {
    try {
        const userId = request.user?.id!
        const data = request.body
        const validated = categorySchema.safeParse(data)

        if (!validated.success) {
            return sendError(response, validated.error.errors[0].message, 400)
        }
        const { name, description } = validated.data
        const category = await prisma.category.create({
            data: {
                name,
                userId,
                description: description
            },
            select: {
                id: true,
                name: true,
                description: true,
                userId: true
            }
        })
        return sendSuccess(response, category, "Category created", 201)
    } catch (error) {
        console.error("Create category controller", error);
        return sendError(response, "Something went wrong")
    }
}

export const editCategory = async (request: AuthRequest, response: Response) => {
    try {
        const userId = request.user?.id!
        const data = request.body
        const categoryId = request.params.id
        const validatedData = categorySchema.safeParse(data)
        if (!validatedData.success) {
            return sendError(response, validatedData.error.errors[0].message, 400)
        }
        const { name, description, userId: user } = validatedData.data
        const existingCategory = await prisma.category.findFirst({
            where: {
                id: categoryId,
                userId: userId
            }
        })

        if (!existingCategory || existingCategory.userId !== user) {
            return sendError(response, "Category does not exists", 404)
        }
        const updatedCategory = await prisma.category.update({
            where: {
                id: existingCategory.id
            },
            data: {
                name,
                description
            },
            select: {
                name: true,
                id: true,
                description: true,
                userId: true
            }
        })
        return sendSuccess(response, updatedCategory, "Category updated", 200)
    } catch (error) {
        console.error("Edit category controller", error);
        sendError(response, "Something went wrong")
    }
}

export const deleteCategory = async (request: AuthRequest, response: Response) => {
    try {
        const userId = request.user?.id!
        const categoryId = request.params.categoryId

        const exisitingCategory = await prisma.category.findFirst({
            where: {
                id: categoryId,
                userId
            }
        })

        if (!exisitingCategory || exisitingCategory.userId !== userId) {
            return sendError(response, "Category does not exists")
        }

        await prisma.category.delete({
            where: {
                id: exisitingCategory.id
            }
        })
        return sendSuccess(response, exisitingCategory.id, "Category deleted", 200)
    } catch (error) {
        console.error("Delete Category controller", error);
        return sendError(response, "Something went wrong")
    }
}

export const getCategories = async (request: AuthRequest, response: Response) => {
    try {
        const userId = request.user?.id!

        const categories = await prisma.category.findMany({
            where: {
                userId
            },
            select: {
                id: true,
                name: true,
                description: true,
            }
        })
        return sendSuccess(response, categories, "Categories fetched", 200)
    } catch (error) {
        console.error("Get categories controller", error);
        sendError(response, "Something went wrong")
    }
}