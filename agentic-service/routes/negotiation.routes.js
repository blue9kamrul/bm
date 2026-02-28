import express from 'express';
import { negotiatePrice } from '../controllers/negotiation.controller.js';
import { negotiationRateLimiter } from '../middlewares/rateLimiter.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { getAllNegotiations } from '../controllers/admin-controllers/negotiationAdmin.controller.js';

const router = express.Router();

router.post('/negotiate', negotiationRateLimiter, authMiddleware, negotiatePrice);
router.get('/admin/negotiations', authMiddleware, getAllNegotiations);

export default router;