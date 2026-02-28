import express from 'express'
import { verifyToken } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import { getUsersAvailableRcc, giftRcc } from '../controllers/rcc.controller.js';

const router = express.Router();

router.get('/available/:userId', verifyToken, getUsersAvailableRcc);
router.post('/gift-rcc', verifyToken, adminMiddleware, giftRcc);

export default router;