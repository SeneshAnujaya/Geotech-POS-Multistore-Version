import express from "express";
import { createPayment, getSingleClientPayments } from "../controllers/paymentController.js";

const router = express.Router();

router.post('/create', createPayment);
router.get('/getPayments/:id', getSingleClientPayments);


export default router;