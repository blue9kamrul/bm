import prisma from "../../config/prisma.js";
import { CustomError } from "../../lib/customError.js";
import { safeAuthUserSelect } from "../../lib/prismaSelects.js";


export const getAllPurchaseRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {
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
          seller: { select: safeAuthUserSelect },
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

export const updatePurchaseRequestStatus = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { status, brittooRejectReason } = req.body;
    const validAdminStatuses = [
      "REJECTED_FROM_BRITTOO",
      "PRODUCT_SUBMITTED_BY_SELLER",
      "PRODUCT_COLLECTED_BY_BUYER",
    ];
    if (!status || !validAdminStatuses.includes(status)) {
      throw new CustomError("Invalid status", 400, "BAD_REQUEST");
    }
    if (status === "REJECTED_FROM_BRITTOO" && !brittooRejectReason) {
      throw new CustomError("Reject reason is required", 400, "BAD_REQUEST");
    }
    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id: requestId },
    });
    if (!purchaseRequest) {
      throw new CustomError("Purchase request not found", 404, "NOT_FOUND");
    }
    const updateData = { status };
    if (brittooRejectReason) {
      updateData.brittooRejectReason = brittooRejectReason;
    }
    const updated = await prisma.purchaseRequest.update({
      where: { id: requestId },
      data: updateData,
      include: {
        product: true,
        seller: { select: safeAuthUserSelect },
        buyer: { select: safeAuthUserSelect },
      },
    });
    res.json({
      success: true,
      message: "Purchase request status updated",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const updatePurchasePaymentStatus = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { paymentStatus } = req.body;
    if (!paymentStatus || !["PENDING", "COMPLETED"].includes(paymentStatus)) {
      throw new CustomError("Invalid payment status", 400, "BAD_REQUEST");
    }
    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id: requestId },
    });
    if (!purchaseRequest) {
      throw new CustomError("Purchase request not found", 404, "NOT_FOUND");
    }
    const updated = await prisma.purchaseRequest.update({
      where: { id: requestId },
      data: { paymentStatus },
      include: {
        product: true,
        seller: { select: safeAuthUserSelect },
        buyer: { select: safeAuthUserSelect },
      },
    });
    res.json({
      success: true,
      message: "Payment status updated",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};