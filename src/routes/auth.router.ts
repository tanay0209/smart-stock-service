import { Router } from "express";
import { accessToken, login, logout, register, userDetails } from "src/controllers/auth.controller";
import { authenticate } from "src/middleware";


const authRouter = Router()

authRouter.post("/v1/register", register)
authRouter.post("/v1/login", login)


authRouter.get("/v1/user-details", authenticate, userDetails)
authRouter.get("/v1/access-token", accessToken)
authRouter.get("/v1/logout", authenticate, logout)

export default authRouter
