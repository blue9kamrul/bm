import express from "express";
import { createOrGetChatRoom, deleteChatRoom, getAllChatRoomsAdmin, getChatMessages, getMyChatRooms } from "../../controllers/user-controllers/purchaseChat.controller.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";
import { adminMiddleware } from "../../middlewares/adminMiddleware.js";

const router = express.Router();

// Create or get chat room for a product
router.post("/room", verifyToken, createOrGetChatRoom);

// Get all chat rooms for current user
router.get("/rooms", verifyToken, getMyChatRooms);
// Get messages for a specific chat room
router.get("/room/:chatRoomId/messages", verifyToken, getChatMessages);


// admin
router.get("/admin/rooms", verifyToken, adminMiddleware, getAllChatRoomsAdmin);
router.delete("/room/:chatRoomId", verifyToken, adminMiddleware, deleteChatRoom);



// Delete chat room

export default router;