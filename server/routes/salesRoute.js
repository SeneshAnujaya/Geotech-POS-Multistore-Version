import express from "express";
import { cancelSaleRecord, createSaleRecordWithStockUpdate, getAllDueSales, getAllReturnCancelSales, getAllSales, getDailyRevenue, getMonthlyRevenue, getMonthlySaleCount, getPaginationSales, getRecent14DaySales, getSalesCount, getTotalRevenue, recordSale } from "../controllers/salesController.js";

const router = express.Router();

// router.post("/createSaleRecord",  recordSale);
router.get("/getSales", getAllSales);
router.get("/getpaginationSales",  getPaginationSales);
router.get("/getDueSales", getAllDueSales);
router.get("/getTotalRevenue/:storeId", getTotalRevenue);
router.get("/getTotalSales/:storeId", getSalesCount);
router.get("/getDailyRevenue/:storeId", getDailyRevenue);
router.get("/getMonthlySaleCount/:storeId", getMonthlySaleCount);
router.post("/createSaleRecordWithStockUpdate", createSaleRecordWithStockUpdate);
router.get("/getMonthlyRevenue/:storeId", getMonthlyRevenue);
router.post("/cancelSale", cancelSaleRecord);
router.get("/getReturnCancel", getAllReturnCancelSales);
router.get("/recent14DaySales", getRecent14DaySales);




export default router;