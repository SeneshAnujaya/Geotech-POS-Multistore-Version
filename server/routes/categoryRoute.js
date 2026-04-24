import express from "express";
import { addCategory, deleteCategory, getAllCategories, getFilteredCategories, updateCategory } from "../controllers/categoryController.js";
import { isAdmin, verifyToken } from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/add", verifyToken, isAdmin,  addCategory);
router.get("/getCategories",  getAllCategories);
router.delete("/deleteCategory/:id", isAdmin, deleteCategory);
router.put("/updateCategory/:id", isAdmin, updateCategory);
router.get("/getFilteredCategories", getFilteredCategories);


export default router;