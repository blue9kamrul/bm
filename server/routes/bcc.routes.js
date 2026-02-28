import express from 'express'
import { acceptBCCRequest, buyBcc, getPendingCreditRequests, getUsersAvailableBcc, rejectBCCRequest } from '../controllers/bcc.controller.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { verificationMiddleware } from '../middlewares/verificationMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.post('/buy', verifyToken, verificationMiddleware, buyBcc);
router.get('/available/:userId', verifyToken, getUsersAvailableBcc);
router.post('/accept/:creditId', verifyToken, adminMiddleware, acceptBCCRequest);
router.put('/reject/:creditId', verifyToken, adminMiddleware, rejectBCCRequest);
router.get('/pending', verifyToken, adminMiddleware, getPendingCreditRequests);


export default router;