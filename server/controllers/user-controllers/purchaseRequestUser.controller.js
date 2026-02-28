import prisma from "../../config/prisma.js";
import { CustomError } from "../../lib/customError.js";
import { safeAuthUserSelect } from "../../lib/prismaSelects.js";
import { createNotification } from "../notification.controller.js";

export const placePurchaseRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      productId,
      dealPrice,
      buyerCollectionMethod,
      buyerPhoneNumber,
      buyerDeliveryAddress,
      buyerPickupTerminal,
    } = req.body;
    if (!productId || !dealPrice || !buyerCollectionMethod || !buyerPhoneNumber) {
      throw new CustomError("Missing required fields", 400, "BAD_REQUEST");
    }
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { owner: true },
    });
    if (!product) {
      throw new CustomError("Product not found", 404, "NOT_FOUND");
    }
    if (!product.isForSale) {
      throw new CustomError("Product is not for sale", 400, "BAD_REQUEST");
    }
    if (product.ownerId === userId) {
      throw new CustomError("Cannot buy your own product", 400, "BAD_REQUEST");
    }
    if (buyerCollectionMethod === "HOME" && !buyerDeliveryAddress) {
      throw new CustomError("Delivery address required for home delivery", 400, "BAD_REQUEST");
    }
    if (buyerCollectionMethod === "BRITTOO_TERMINAL" && !buyerPickupTerminal) {
      throw new CustomError("Pickup terminal required", 400, "BAD_REQUEST");
    }

    const platformCharge = Math.round(parseInt(dealPrice) * 0.01); // 1% platform charge. 
    // EKhance change korle please change on ManagePlacedPurchaseRequests.jsx file too (5%)
    const totalPrice = parseInt(dealPrice) + platformCharge;

    const purchaseRequest = await prisma.purchaseRequest.create({
      data: {
        productId,
        buyerId: userId,
        sellerId: product.ownerId,
        askingPrice: product.askingPrice || 0,
        dealPrice: parseInt(dealPrice),
        totalPrice,
        platformCharge,
        buyerCollectionMethod,
        buyerPhoneNumber,
        buyerDeliveryAddress: buyerCollectionMethod === "HOME" ? buyerDeliveryAddress : null,
        buyerPickupTerminal: buyerCollectionMethod === "BRITTOO_TERMINAL" ? buyerPickupTerminal : null,
        sellerPhoneNumber: product.owner.phoneNumber || "",
      },
      include: {
        product: true,
        seller: { select: safeAuthUserSelect },
        buyer: { select: safeAuthUserSelect },
      },
    });

    // emit notification to seller
    try {
      const title = 'New Purchase Request 😍';
      const body = `You have received a purchase request for ${purchaseRequest.product.name}🥳`;
      const data = { url: '/dashboard/received-purchase-requests' };
      await createNotification(purchaseRequest.seller.id, title, body, data);
      //await createNotification("admin-id", title, body, data);
    } catch (error) {
      console.error("error in notification in create purchase request", error);
    }

    res.status(201).json({
      success: true,
      message: "Purchase request placed successfully",
      data: purchaseRequest,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const acceptPurchaseRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;
    const {
      sellerDeliveryMethod,
      sellerPhoneNumber,
      sellerDeliveryAddress,
      sellerDeliveryTerminal,
    } = req.body;
    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id: requestId },
    });
    if (!purchaseRequest) {
      throw new CustomError("Purchase request not found", 404, "NOT_FOUND");
    }
    if (purchaseRequest.sellerId !== userId) {
      throw new CustomError("Unauthorized", 403, "FORBIDDEN");
    }
    if (purchaseRequest.status !== "REQUESTED_BY_BUYER") {
      throw new CustomError("Cannot accept this request", 400, "BAD_REQUEST");
    }
    if (sellerDeliveryMethod === "HOME" && !sellerDeliveryAddress) {
      throw new CustomError("Delivery address required", 400, "BAD_REQUEST");
    }
    if (sellerDeliveryMethod === "BRITTOO_TERMINAL" && !sellerDeliveryTerminal) {
      throw new CustomError("Delivery terminal required", 400, "BAD_REQUEST");
    }
    const updated = await prisma.purchaseRequest.update({
      where: { id: requestId },
      data: {
        status: "ACCEPTED_BY_SELLER",
        sellerDeliveryMethod,
        sellerPhoneNumber,
        sellerDeliveryAddress: sellerDeliveryMethod === "HOME" ? sellerDeliveryAddress : null,
        sellerDeliveryTerminal: sellerDeliveryMethod === "BRITTOO_TERMINAL" ? sellerDeliveryTerminal : null,
      },
      include: {
        product: true,
        seller: { select: safeAuthUserSelect },
        buyer: { select: safeAuthUserSelect },
      },
    });
    //Emit notification to buyer
    try {
      const title = 'Request Accepted';
      const body = `Your purchase request for product ${updated.product.name} has been accepted 😍`;
      const data = { url: '/dashboard/placed-purchase-requests' };
      await createNotification(updated.buyer.id, title, body, data);
    } catch (error) {
      console.error("error in accept purchase notification", error);
    }
    res.json({
      success: true,
      message: "Purchase request accepted",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const rejectPurchaseRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;
    const { sellerRejectReason } = req.body;
    if (!sellerRejectReason) {
      throw new CustomError("Reject reason is required", 400, "BAD_REQUEST");
    }
    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id: requestId },
    });
    if (!purchaseRequest) {
      throw new CustomError("Purchase request not found", 404, "NOT_FOUND");
    }
    if (purchaseRequest.sellerId !== userId) {
      throw new CustomError("Unauthorized", 403, "FORBIDDEN");
    }
    if (purchaseRequest.status !== "REQUESTED_BY_BUYER") {
      throw new CustomError("Cannot reject this request", 400, "BAD_REQUEST");
    }
    const updated = await prisma.purchaseRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED_BY_SELLER",
        sellerRejectReason,
      },
      include: {
        product: true,
        seller: { select: safeAuthUserSelect },
        buyer: { select: safeAuthUserSelect },
      },
    });
    try {
      const title = 'Request Rejected 😓';
      const body = `Your purchase request for product ${updated.product.name} has been rejected 🤧`;
      const data = { url: '/dashboard/placed-purchase-requests' };
      await createNotification(updated.buyer.id, title, body, data);
    } catch (notificationError) {
      console.error("Failed to create notification:", notificationError);
    }
    res.json({
      success: true,
      message: "Purchase request rejected",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const cancelPurchaseRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;
    const { buyerCancelReason } = req.body;
    if (!buyerCancelReason) {
      throw new CustomError("Cancel reason is required", 400, "BAD_REQUEST");
    }
    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id: requestId },
    });
    if (!purchaseRequest) {
      throw new CustomError("Purchase request not found", 404, "NOT_FOUND");
    }
    if (purchaseRequest.buyerId !== userId) {
      throw new CustomError("Unauthorized", 403, "FORBIDDEN");
    }
    if (!["REQUESTED_BY_BUYER", "ACCEPTED_BY_SELLER"].includes(purchaseRequest.status)) {
      throw new CustomError("Cannot cancel this request", 400, "BAD_REQUEST");
    }
    const updated = await prisma.purchaseRequest.update({
      where: { id: requestId },
      data: {
        status: "CANCELLED_BY_BUYER",
        buyerCancelReason,
      },
      include: {
        product: true,
        seller: { select: safeAuthUserSelect },
        buyer: { select: safeAuthUserSelect },
      },
    });

    // to seller
    try {
      const title = 'Purchase Request Cancelled 😓';
      const body = `The purchase request for product ${updated.product.name} has been cancelled by the renter`;
      const data = { url: '/dashboard/received-purchase-requests' };
      await createNotification(updated.seller.id, title, body, data);
    } catch (error) {
      console.error("Failed to create notification:", error);
    }

    res.json({
      success: true,
      message: "Purchase request cancelled",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getUserPlacedRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {
      buyerId: userId,
      deletedAt: null,
    };
    if (status) {
      where.status = status;
    }
    const [requests, total] = await Promise.all([
      prisma.purchaseRequest.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            include: {
              owner: { select: safeAuthUserSelect },
            },
          },
          seller: { select: safeAuthUserSelect },
        },
      }),
      prisma.purchaseRequest.count({ where }),
    ]);
    res.json({
      success: true,
      data: requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getUserReceivedRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {
      sellerId: userId,
      deletedAt: null,
    };
    if (status) {
      where.status = status;
    }
    const [requests, total] = await Promise.all([
      prisma.purchaseRequest.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          product: true,
          buyer: { select: safeAuthUserSelect },
        },
      }),
      prisma.purchaseRequest.count({ where }),
    ]);
    res.json({
      success: true,
      data: requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};