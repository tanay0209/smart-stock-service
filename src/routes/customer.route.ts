import { Router } from "express";
import { createCustomer, getAllCustomers, getCustomer, removeCustomer, updateCustomer } from "../controllers/customer.controller.js";
import { authenticate } from "../middleware.js";

const customerRouter = Router()


customerRouter.post("/v1/create", authenticate, createCustomer)
customerRouter.post("/v1/update", authenticate, updateCustomer)
customerRouter.post("/v1/remove", authenticate, removeCustomer)

customerRouter.get("/v1/get", authenticate, getCustomer)
customerRouter.get("/v1/get-all/:storeId", authenticate, getAllCustomers)


export default customerRouter

