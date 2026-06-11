import express from "express";
import { verifyToken } from "../utils/authMiddleware.js";
import { addRepair } from "../controllers/repairController.js";

const router = express.Router();

router.post("/add", verifyToken, addRepair);
// router.get("/", getRepairs);

export default router;
