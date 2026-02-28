import express from "express";
import { productImageUpload } from "../middlewares/productImageUpload.js";
import { createProduct, deleteProduct, getProducts, updateProductAdmin, updateProductUser } from "../controllers/product.controller.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { verificationMiddleware } from "../middlewares/verificationMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", verifyToken, verificationMiddleware, productImageUpload, createProduct);
router.delete("/:id", verifyToken, verificationMiddleware, deleteProduct);
router.put("/update/user/:id", verifyToken, verificationMiddleware, updateProductUser);


//admin routes
router.put("/update/admin/:id", verifyToken, adminMiddleware, productImageUpload, updateProductAdmin);

export default router;
