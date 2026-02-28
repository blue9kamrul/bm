import express from "express";
import { getAllPurchaseRequests, updatePurchasePaymentStatus, updatePurchaseRequestStatus } from "../../controllers/admin-controllers/purchaseRequestAdmin.controller.js";
import { adminMiddleware } from "../../middlewares/adminMiddleware.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// Admin routes
router.get("/all", verifyToken, adminMiddleware, getAllPurchaseRequests);
router.put("/:requestId/status", verifyToken, adminMiddleware, updatePurchaseRequestStatus);
router.put("/:requestId/payment-status", verifyToken, adminMiddleware, updatePurchasePaymentStatus);

export default router;