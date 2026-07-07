import express from "express";
import { verifyToken } from "../utils/authMiddleware.js";
import { addRepair, deleteRepair, getRepairs, getSingleRepair, updateRepairDetailsPage, updateRepairFromTable } from "../controllers/repairController.js";

const router = express.Router();

router.post("/add", verifyToken, addRepair);
router.get("/", getRepairs);
router.get("/:repairId", verifyToken, getSingleRepair);
router.put("/:repairJobId", verifyToken, updateRepairFromTable);
router.patch("/:repairJobId", verifyToken, updateRepairDetailsPage);
router.delete("/:repairJobId", verifyToken, deleteRepair);

export default router;
