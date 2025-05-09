import { Router } from "express";
import { createCategory, deleteCategory, editCategory, getCategories } from "../controllers/category.controller.js";
import { authenticate } from "../middleware.js";

const categoryRouter = Router()


categoryRouter.post("/v1/create", authenticate, createCategory)

categoryRouter.put("/v1/update/:categoryId", editCategory)

categoryRouter.delete("/v1/delete/:categoryId", authenticate, deleteCategory)

categoryRouter.get("/v1/get-categories", authenticate, getCategories)

export default categoryRouter