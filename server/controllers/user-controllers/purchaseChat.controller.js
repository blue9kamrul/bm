import prisma from "../../config/prisma.js";
import { CustomError } from "../../lib/customError.js";
import { isUserOnline } from "../../socket/chatSocket.js";

// Create or get existing chat room
export const createOrGetChatRoom = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const buyerId = req.user.id;

    // Verify product exists and is for sale
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!product) {
      throw new CustomError("Product not found", 404);
    }

    if (!product.isForSale) {
      throw new CustomError("This product is not for sale", 400);
    }

    if (product.ownerId === buyerId) {
      throw new CustomError("You cannot chat with yourself", 400);
    }

    let chatRoom = await prisma.chatRoom.findFirst({
      where: {
        productId,
        buyerId
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            productImages: true,
            askingPrice: true,
            minPrice: true
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        messages: {
          take: 50, // Load initial 50 messages
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // If not found, create it
    if (!chatRoom) {
      chatRoom = await prisma.chatRoom.create({
        data: {
          productId,
          buyerId,
          sellerId: product.ownerId
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              productImages: true,
              askingPrice: true,
              minPrice: true
            }
          },
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          messages: {
            take: 50,
            orderBy: { createdAt: 'desc' },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });
    }

    // Get total message count
    const totalMessages = await prisma.message.count({
      where: { chatRoomId: chatRoom.id }
    });

    // Check if seller is online
    const isSellerOnline = isUserOnline(product.ownerId);

    // Reverse messages so oldest is first
    const messagesInOrder = chatRoom.messages.reverse();

    res.status(200).json({
      success: true,
      message: "Chat room ready",
      data: {
        ...chatRoom,
        messages: messagesInOrder,
        totalMessages,
        hasMore: totalMessages > 50,
        isSellerOnline
      }
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Get all chat rooms for current user
export const getMyChatRooms = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId }
        ],
        isActive: true
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            productImages: true,
            askingPrice: true,
            minPrice: true,
            isForSale: true
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId },
                isRead: false
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Add online status for each chat partner
    const chatRoomsWithStatus = chatRooms.map(room => {
      const partnerId = room.buyerId === userId ? room.sellerId : room.buyerId;
      return {
        ...room,
        unreadCount: room._count.messages,
        isPartnerOnline: isUserOnline(partnerId)
      };
    });

    res.status(200).json({
      success: true,
      message: "Chat rooms retrieved successfully",
      data: chatRoomsWithStatus
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Get messages for a chat room with pagination
export const getChatMessages = async (req, res, next) => {
  try {
    const { chatRoomId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "ADMIN";
    const { page = 1, limit = 50 } = req.query;

    // Verify user has access and get room details
    const chatRoom = await prisma.chatRoom.findFirst({
      where: {
        id: chatRoomId,
        ...(isAdmin
          ? {} // if admin, no user restriction
          : {
            OR: [
              { buyerId: userId },
              { sellerId: userId }
            ]
          })
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            productImages: true,
            askingPrice: true,
            minPrice: true
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!chatRoom) {
      throw new CustomError("Chat room not found or access denied", 404);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Get messages with pagination
    const messages = await prisma.message.findMany({
      where: { chatRoomId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum
    });

    const totalMessages = await prisma.message.count({
      where: { chatRoomId }
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        chatRoomId,
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });

    // Reverse so oldest is first
    const messagesInOrder = messages.reverse();

    // Check if partner is online
    const partnerId = chatRoom.buyerId === userId ? chatRoom.sellerId : chatRoom.buyerId;
    const isPartnerOnline = isUserOnline(partnerId);

    res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      data: {
        messages: messagesInOrder,
        chatRoom: {
          id: chatRoom.id,
          product: chatRoom.product,
          buyer: chatRoom.buyer,
          seller: chatRoom.seller,
          buyerId: chatRoom.buyerId,
          sellerId: chatRoom.sellerId,
          isPartnerOnline
        },
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalMessages / limitNum),
          totalMessages,
          hasMore: pageNum * limitNum < totalMessages
        }
      }
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Delete chat room (soft delete by marking inactive)
export const deleteChatRoom = async (req, res, next) => {
  try {
    const { chatRoomId } = req.params;
    const userId = req.user.id;

    // Verify user has access to this chat room
    const chatRoom = await prisma.chatRoom.findFirst({
      where: {
        id: chatRoomId,
        OR: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      }
    });

    if (!chatRoom) {
      throw new CustomError("Chat room not found or access denied", 404);
    }

    // Mark as inactive
    await prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: { isActive: false }
    });

    res.status(200).json({
      success: true,
      message: "Chat room deleted successfully"
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};



export const getAllChatRoomsAdmin = async (req, res, next) => {
  try {
    const chatRooms = await prisma.chatRoom.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        buyer: {
          select: { id: true, name: true, email: true }
        },
        seller: {
          select: { id: true, name: true, email: true }
        },
        product: {
          select: { id: true, name: true }
        },
        messages: {
          take: 1, // last message preview
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { messages: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "All chat rooms fetched",
      data: chatRooms
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};