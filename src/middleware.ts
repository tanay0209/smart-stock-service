import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { sendError } from "src/lib/api-response"
import { AuthRequest } from "./lib/auth-request"


export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return sendError(res, "Authorization token missing", 401)
        }

        const token = authHeader.split(" ")[1]

        if (!token) {
            return sendError(res, "Token not found", 401)
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }

        req.user.id = decoded.userId
        next()
    } catch (error: any) {
        return sendError(res, "Invalid token", 401)
    }
}
