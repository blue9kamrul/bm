import express from "express";
import { acceptPurchaseRequest, cancelPurchaseRequest, getUserPlacedRequests, getUserReceivedRequests, placePurchaseRequest, rejectPurchaseRequest } from "../../controllers/user-controllers/purchaseRequestUser.controller.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";
import { verificationMiddleware } from "../../middlewares/verificationMiddleware.js";

const router = express.Router();

// Buyer routes
router.post("/place", verifyToken, verificationMiddleware, placePurchaseRequest);
router.put("/:requestId/cancel", verifyToken, verificationMiddleware, cancelPurchaseRequest);
router.get("/placed", verifyToken, verificationMiddleware, getUserPlacedRequests);

// Seller routes
router.put("/:requestId/accept", verifyToken, verificationMiddleware, acceptPurchaseRequest);
router.put("/:requestId/reject", verifyToken, verificationMiddleware, rejectPurchaseRequest);
router.get("/received", verifyToken, verificationMiddleware, getUserReceivedRequests);

export default router;