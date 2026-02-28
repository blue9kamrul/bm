import express from 'express';
import { getSentNotifications, getUserNotifications, markAsRead, saveSubscription, sendCustomNotification } from '../controllers/notification.controller.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.post('/subscribe', verifyToken, saveSubscription);
router.get('/', verifyToken, getUserNotifications);
router.put('/:id/read', verifyToken, markAsRead);

// -------------- ADMIN ------------
router.post('/custom', verifyToken, adminMiddleware, sendCustomNotification);
router.get('/sent', verifyToken, adminMiddleware, getSentNotifications);


export default router;