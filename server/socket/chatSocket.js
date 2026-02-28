import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { safeAuthUserSelect } from "../lib/prismaSelects.js";
import { createNotification } from "../controllers/notification.controller.js";

let io;
const onlineUsers = new Map(); // userId: socketId

// Init
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_BASE_URL,
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"]
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
  });

  // auth middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("No authentication token provided"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id, deletedAt: null },
        select: safeAuthUserSelect,
      });
      if (!user) {
        return next(new Error("User not found"));
      }
      if (user.isSuspended) {
        return next(new Error("Account is suspended"));
      }
      socket.user = user;
      socket.userId = user.id;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return next(new Error("Token expired, Please Log in again"));
      }
      if (error.name === "JsonWebTokenError") {
        return next(new Error("Invalid token. Please log in again"));
      }
      next(new Error("Authentication failed. Please log in again"));
    }
  });

  io.on("connection", (socket) => {
    onlineUsers.set(socket.userId, socket.id);

    io.emit("user_status", {
      userId: socket.userId,
      isOnline: true
    });

    socket.on("join_room", async ({ chatRoomId }) => {
      try {
        const chatRoom = await prisma.chatRoom.findFirst({
          where: {
            id: chatRoomId,
            OR: [
              { buyerId: socket.userId },
              { sellerId: socket.userId }
            ]
          }
        });
        if (!chatRoom) {
          socket.emit("error", { message: "Access denied" });
          return;
        }
        socket.join(chatRoomId);
        // Mark all unread messages as read
        await prisma.message.updateMany({
          where: {
            chatRoomId,
            senderId: { not: socket.userId },
            isRead: false
          },
          data: { isRead: true }
        });
        socket.to(chatRoomId).emit("messages_read", { chatRoomId });
        const partnerId = socket.userId === chatRoom.buyerId ? chatRoom.sellerId : chatRoom.buyerId;
        const isPartnerOnline = onlineUsers.get(partnerId);
        if (isPartnerOnline) {
          io.to(chatRoomId).emit("partner_status", { isOnline: true })
        } else io.to(chatRoomId).emit("partner_status", { isOnline: false })
      } catch (error) {
        console.error("Join room error:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });


    socket.on("send_message", async ({ chatRoomId, content }) => {
      try {
        const chatRoom = await prisma.chatRoom.findFirst({
          where: {
            id: chatRoomId,
            OR: [
              { buyerId: socket.userId },
              { sellerId: socket.userId }
            ]
          }
        });
        if (!chatRoom) {
          socket.emit("error", { message: "Access denied" });
          return;
        }
        const message = await prisma.message.create({
          data: {
            chatRoomId,
            senderId: socket.userId,
            content: content.trim()
          },
          include: {
            sender: {
              select: { id: true, name: true }
            }
          }
        });
        io.to(chatRoomId).emit("new_message", message);
        const recipientId = socket.userId === chatRoom.buyerId
          ? chatRoom.sellerId
          : chatRoom.buyerId;
        let data = {};
        const inComing = socket.userId === chatRoom.sellerId;
        if(!inComing) {
          data.url = '/dashboard/incoming-chats';
        } else data.url = '/dashboard/outgoing-chats';

        if (!onlineUsers.has(recipientId)) {
          // TODO: Send push notification
          const title = 'New Message';
          const body = message.content;
          await createNotification(recipientId, title, body, data);
        }
      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });


    socket.on("typing", ({ chatRoomId, isTyping }) => {
      socket.to(chatRoomId).emit("user_typing", {
        userId: socket.userId,
        isTyping
      });
    });


    socket.on("leave_room", (chatRoomId) => {
      socket.leave(chatRoomId);
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(socket.userId);
      io.emit("user_status", {
        userId: socket.userId,
        isOnline: false
      });
    });
  });
  console.log("Socket.IO initialized");
  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};

export const isUserOnline = (userId) => {
  return onlineUsers.has(userId);
};


