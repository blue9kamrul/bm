import express from "express";
import {
  completeWithdrawalRequest,
  createWithdrawalRequest,
  getAllWithdrawalRequests,
  getMyWithdrawalRequests,
  rejectWithdrawalRequest,
} from "../controllers/withdrawalRequest.controller.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { verificationMiddleware } from "../middlewares/verificationMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.post(
  "/request",
  verifyToken,
  verificationMiddleware,
  createWithdrawalRequest,
);
router.get("/", verifyToken, verificationMiddleware, getMyWithdrawalRequests);


// Admin only
router.get("/admin", verifyToken, adminMiddleware, getAllWithdrawalRequests);
router.put(
  "/:requestId/complete",
  verifyToken,
  adminMiddleware,
  completeWithdrawalRequest,
);
router.put(
  "/:requestId/reject",
  verifyToken,
  adminMiddleware,
  rejectWithdrawalRequest,
);

export default router;
