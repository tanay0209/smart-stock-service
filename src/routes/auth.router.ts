import { Router } from "express";
import { accessToken, login, logout, register, userDetails } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware.js";


const authRouter = Router()

authRouter.post("/v1/register", register)
authRouter.post("/v1/login", login)
authRouter.post("/v1/access-token", authenticate, accessToken)


authRouter.get("/v1/user-details", authenticate, userDetails)
authRouter.get("/v1/logout", authenticate, logout)

export default authRouter
