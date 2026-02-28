import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import { getAnalytics, holdProduct } from '../controllers/adminDashboard.controller.js';

const router = express.Router();

router.put("/hold/:productId", verifyToken, adminMiddleware, holdProduct);
router.get("/analytics", verifyToken, adminMiddleware, getAnalytics);

export default router;