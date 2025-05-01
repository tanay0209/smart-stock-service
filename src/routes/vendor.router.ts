import { Router } from "express";
import { createVendor, deleteVendor, getVendors, updateVendor } from "../controllers/vendor.controller.js";
import { authenticate } from "../middleware.js";


const vendorRouter = Router()


vendorRouter.post("/v1/create", authenticate, createVendor)

vendorRouter.delete("/v1/delete", authenticate, deleteVendor)

//vendor id
vendorRouter.put("/v1/update/:id", authenticate, updateVendor)

//store id
vendorRouter.get("/v1/vendors/:id", authenticate, getVendors)


export default vendorRouter