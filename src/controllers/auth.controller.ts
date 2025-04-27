import { Request, Response } from "express"
import { registerSchema } from "../schemas/register.schema.js"
import { sendError, sendSuccess } from "../lib/api-response.js"
import prisma from "../lib/prisma.js"
import { generateAccessToken, hashPassword, generateRefreshToken, verifyPassword } from "../lib/utils.js"
import { loginSchema } from "../schemas/login.schema.js"
import { AuthRequest } from "../lib/auth-request.js"
import jwt from 'jsonwebtoken'

export const register = async (request: Request, response: Response) => {
    try {
        const data = request.body
        const validatedData = registerSchema.safeParse(data)
        if (!validatedData.success) {
            return sendError(response, validatedData.error.errors[0].message, 400)
        }
        const { username, email, password } = validatedData.data
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        })
        if (existingUser) {
            return sendError(response, "Username or email already exists")
        }
        if (!password) {
            await prisma.user.create({
                data: {
                    username,
                    email
                }
            })
            return sendSuccess(response, null, "User registered successfully")
        }
        const hashedPassword = await hashPassword(password)
        await prisma.user.create({
            data: {
                password: hashedPassword,
                username,
                email
            }
        })
        return sendSuccess(response, null, "User created", 201)
    } catch (error) {
        console.error("Register Controller", error)
        return sendError(response, "Something went wrong")
    }
}

export const login = async (request: Request, response: Response) => {
    try {
        const data = request.body
        const validatedData = loginSchema.safeParse(data)
        if (!validatedData.success) {
            return sendError(response, validatedData.error.errors[0].message, 400)
        }
        const { userId, password } = validatedData.data

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: userId },
                    { email: userId }
                ]
            },
            select: {
                id: true,
                username: true,
                password: true,
                role: true,
                email: true,
            }
        })

        if (!user) {
            return sendError(response, "No user found", 401)
        }

        if (!verifyPassword(user.password!, password)) {
            return sendError(response, "Invalid password", 401)
        }
        user.password = null
        const accessToken = generateAccessToken(user.id)
        const refreshToken = generateRefreshToken(user.id)

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                refreshToken
            }
        })
        return sendSuccess(response, { ...user, accessToken, refreshToken }, "Logged in successfully", 200)
    } catch (error) {
        console.error("Login Controller", error);
        return sendError(response, "Something went wrong")
    }
}

export const userDetails = async (request: AuthRequest, response: Response) => {
    try {
        const userId = request.user!.id
        const user = await prisma.user.findFirst({
            where: {
                id: userId
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                shops: {
                    select: {
                        shop: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        })

        if (!user) {
            return sendError(response, "User not found", 400)
        }
        return sendSuccess(response, user, "User details fetched", 200)
    } catch (error) {
        console.error("User details controller", error);
        return sendError(response, "Something went wrong")
    }
}

export const logout = async (request: AuthRequest, response: Response) => {
    try {
        const userId = request.user!.id
        const user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        })
        if (!user) {
            return sendError(response, "User not found", 401)
        }
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                refreshToken: null
            }
        })
        return sendSuccess(response, null, "Logged out successfully", 200)
    } catch (error) {
        console.error("Logout controller", error);
        return sendError(response, "Something went wrong")
    }
}

export const accessToken = async (request: AuthRequest, response: Response) => {
    try {
        const { refreshToken } = request.body
        if (!refreshToken) {
            return sendError(response, "Refresh token required", 400)
        }

        const exisitingToken = await prisma.user.findFirst({
            where: {
                refreshToken,
            },
            select: {
                refreshToken: true
            }
        })

        if (!exisitingToken || !exisitingToken.refreshToken) {
            return sendError(response, "Invalid refresh token", 401)
        }
        let decoded
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { userId: string }
        } catch (err: any) {
            return sendError(response, "Token expired", 401)
        }
        const { userId } = decoded
        const newToken = generateRefreshToken(userId)
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                refreshToken: newToken
            }
        })
        const accessToken = generateAccessToken(userId)
        return sendSuccess(response, { accessToken, refreshToken: newToken }, "Access token generated")
    } catch (error) {
        console.error("Generate Refresh token controller", error);
        return sendError(response, "Something went wrong")
    }
}