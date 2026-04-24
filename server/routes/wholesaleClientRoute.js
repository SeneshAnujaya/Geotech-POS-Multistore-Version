import express from "express";
import {isAdmin} from '../utils/authMiddleware.js';
import { addBulkBuyer, deleteBulkBuyer, getBulkBuyers, updateBulkBuyer } from "../controllers/wholesaleclientController.js";

const router = express.Router();

router.post('/add',addBulkBuyer);
router.get('/getBulkBuyers', getBulkBuyers);
router.put("/update/:id", updateBulkBuyer);
router.delete("/delete/:id", deleteBulkBuyer);


export default router;