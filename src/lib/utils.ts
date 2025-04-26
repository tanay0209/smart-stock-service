import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10)
}

export const verifyPassword = (password: string, hash: string): boolean => {
    return bcrypt.compareSync(password, hash)
}

export const generateAccessToken = (userId: string): string => {
    return jwt.sign(userId, process.env.JWT_SECRET!, { expiresIn: 60 * 60 * 24 * 7 })
}

export const generateRefreshToken = (userId: string): string => {
    return jwt.sign(userId, process.env.JWT_SECRET!, { expiresIn: 60 * 60 * 24 * 7 })
}
