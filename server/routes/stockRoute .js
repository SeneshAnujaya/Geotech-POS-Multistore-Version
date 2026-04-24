import express from "express";
import { createStore, deleteStore, getStores, updateStore } from "../controllers/storeController.js";
import { isAdmin } from "../utils/authMiddleware.js";
import { addStock, deleteStock, getStocks, updateStock } from "../controllers/stockController.js";

const router = express.Router();

router.get("/", getStocks);
router.post("/create", isAdmin, addStock);
router.put("/update", isAdmin, updateStock);
router.delete("/delete/:id", isAdmin, deleteStock);

export default router;