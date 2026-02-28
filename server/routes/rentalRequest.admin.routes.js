import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import {
  getAllRentalRequests,
  rejectRentalRequestAdmin,
  updateRentalRequestStatus,
} from "../controllers/rentalRequest.admin.controller.js";

const router = express.Router();

router.get("/", verifyToken, adminMiddleware, getAllRentalRequests);
router.put(
  "/:requestId/update-status",
  verifyToken,
  adminMiddleware,
  updateRentalRequestStatus,
);
router.put(
  "/:requestId/reject",
  verifyToken,
  adminMiddleware,
  rejectRentalRequestAdmin,
);

export default router;
