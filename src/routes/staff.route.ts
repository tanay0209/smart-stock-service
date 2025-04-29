import { Router } from "express"
import { createStaff, getStaffsOfStore, removeStaff, updateStaff } from "../controllers/staff.controller.js"
import { authenticate } from "../middleware.js"

const staffRouter = Router()


staffRouter.post("/v1/staff/create", authenticate, createStaff)

staffRouter.delete("/v1/staff/remove", authenticate, removeStaff)

staffRouter.put("/v1/staff/update", authenticate, updateStaff)

staffRouter.get("/v1/staff/get-staffs/:storeId", authenticate, getStaffsOfStore)


export default staffRouter
