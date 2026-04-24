import express from "express";
import { addProduct, deleteProduct, getAllProducts,  getPaginatedFilteredProducts,  getPaginationProducts,  updateProduct,  updateProductsStock  } from "../controllers/productController.js";
import { isAdmin, verifyToken } from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/add", isAdmin,  addProduct);
router.get("/getproducts",  getAllProducts);
router.get("/getpaginationProducts",  getPaginationProducts);
router.get("/getfilteredPaginatedProducts", getPaginatedFilteredProducts)
router.post("/updatestock",  updateProductsStock);
router.delete("/delete/:sku", isAdmin, deleteProduct);
router.put("/updateproduct/:sku", isAdmin, updateProduct);


export default router;