import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { getUserCreditHistory, getUserOverview } from '../controllers/userDashboard.controller.js';

const router = express.Router();

router.get('/credits/credit-history', verifyToken, getUserCreditHistory);
router.get('/overview', verifyToken, getUserOverview);

export default router;