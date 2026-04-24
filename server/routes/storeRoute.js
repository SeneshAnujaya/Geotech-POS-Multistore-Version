import express from "express";
import { createStore, deleteStore, getStores, updateStore } from "../controllers/storeController.js";
import { isAdmin } from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/create",isAdmin, createStore);
router.put("/update/:id", isAdmin, updateStore);
router.patch("/delete/:id", isAdmin, deleteStore);
router.get("/", getStores);

export default router;