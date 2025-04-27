import { Router } from "express";
import { authenticate } from "../middleware.js";
import { createStore, deleteStore, storesAssociatedWithUser, updateStore, userOwnedStores } from "../controllers/store.controller.js";


const storeRouter = Router()


storeRouter.post("/v1/create", authenticate, createStore)

storeRouter.delete("/v1/delete/:id", authenticate, deleteStore)

storeRouter.put("/v1/update/:id", authenticate, updateStore)

storeRouter.get("/v1/owned-store", authenticate, userOwnedStores)
storeRouter.get("/v1/store-member", authenticate, storesAssociatedWithUser)


export default storeRouter