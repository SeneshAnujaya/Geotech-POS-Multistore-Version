import express from "express";
import { verifyToken } from "../utils/authMiddleware.js";
import {
  addRepair,
  addRepairInvoicePayment,
  addRepairPart,
  createRepairInvoice,
  deleteRepair,
  getRepairs,
  getSingleRepair,
  returnRepairPart,
  updateRepairDetailsPage,
  updateRepairFromTable,
} from "../controllers/repairController.js";

const router = express.Router();

router.post("/add", verifyToken, addRepair);
router.get("/", getRepairs);
router.post("/:repairJobId/invoice", verifyToken, createRepairInvoice);
router.post("/invoices/:repairInvoiceId/payments", verifyToken, addRepairInvoicePayment);
router.post("/:repairJobId/parts", verifyToken, addRepairPart);
router.delete("/:repairJobId/parts/:repairPartId", verifyToken, returnRepairPart);
router.get("/:repairId", verifyToken, getSingleRepair);
router.put("/:repairJobId", verifyToken, updateRepairFromTable);
router.patch("/:repairJobId", verifyToken, updateRepairDetailsPage);
router.delete("/:repairJobId", verifyToken, deleteRepair);

export default router;
