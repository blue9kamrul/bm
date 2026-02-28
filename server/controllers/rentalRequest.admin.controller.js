import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";
import { safeAuthUserSelect } from "../lib/prismaSelects.js";
import { createNotification } from "./notification.controller.js";

export const getAllRentalRequests = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const { status, search, productId, ownerId, requesterId, productSL } =
      req.query;

    const skip = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (productId) where.productId = productId;
    if (ownerId) where.ownerId = ownerId;
    if (requesterId) where.requesterId = requesterId;
    if (productSL) where.productSL = productSL;

    if (search) {
      where.OR = [
        { product: { name: { contains: search, mode: "insensitive" } } },
        { owner: { name: { contains: search, mode: "insensitive" } } },
        { requester: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [rentalRequests, total] = await Promise.all([
      prisma.rentalRequest.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: true,
          coupon: true,
          owner: { select: safeAuthUserSelect },
          requester: { select: safeAuthUserSelect },
          bccWallet: true,
          bccTransactions: true,
          rccUsageDetails: {
            include: {
              redCacheCredit: {
                include: {
                  sourceProduct: true
                }
              }
            }
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.rentalRequest.count({ where }),
    ]);

    res.json({
      success: true,
      message: "Rental req data fetched successfully",
      data: rentalRequests,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Update rental request status
export const updateRentalRequestStatus = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "PRODUCT_SUBMITTED_BY_OWNER",
      "PRODUCT_COLLECTED_BY_RENTER",
      "PRODUCT_RETURNED_BY_RENTER",
      "PRODUCT_RETURNED_TO_OWNER",
    ];
    if (!validStatuses.includes(status)) {
      throw new CustomError("Invalid status value", 400);
    }

    const rentalReq = await prisma.rentalRequest.findUnique({
      where: {
        id: requestId,
        deletedAt: null
      },
      include: {
        rccUsageDetails: {
          include: {
            redCacheCredit: true,
          },
        },
        bccWallet: true,
      },
    });
    if (!rentalReq) {
      throw new CustomError("Request not found", 404);
    }

    let updatedRequest;
    if (status === "PRODUCT_RETURNED_BY_RENTER" || status === "PRODUCT_RETURNED_TO_OWNER") {
      updatedRequest = await prisma.$transaction(async (tx) => {
        const updates = [];
        // Handle BCC refund
        if (rentalReq.paidWithBcc && rentalReq.usedBccAmount && rentalReq.bccWalletId) {
          updates.push(
            tx.bccWallet.update({
              where: { id: rentalReq.bccWalletId },
              data: {
                availableBalance: { increment: rentalReq.usedBccAmount },
                lockedBalance: { decrement: rentalReq.usedBccAmount },
              },
            }),
          );
          updates.push(
            tx.bccTransaction.create({
              data: {
                userId: rentalReq.requesterId,
                walletId: rentalReq.bccWalletId,
                rentalRequestId: rentalReq.id,
                amount: rentalReq.usedBccAmount,
                status: "ACCEPTED",
                transactionType: "DEPOSIT_REFUND",
              },
            }),
          );
        }
        // Handle RCC refund
        if (rentalReq.paidWithRcc && rentalReq.rccUsageDetails.length > 0) {
          for (const usage of rentalReq.rccUsageDetails) {
            updates.push(
              tx.redCacheCredit.update({
                where: { id: usage.redCacheCreditId, deletedAt: null },
                data: {
                  inUse: { decrement: usage.usedAmount },
                },
              }),
            );
          }
        }
        // Update rental request status
        updates.push(
          tx.rentalRequest.update({
            where: { id: requestId },
            data: {
              status: status,
            },
            include: {
              product: true,
              owner: { select: safeAuthUserSelect },
              requester: { select: safeAuthUserSelect },
            },
          }),
        );

        const results = await Promise.all(updates);
        const updatedRequest = results[results.length - 1];
        return updatedRequest;
      });
    } else {
      updatedRequest = await prisma.rentalRequest.update({
        where: { id: requestId },
        data: { status },
        include: {
          product: true,
          owner: { select: safeAuthUserSelect },
          requester: { select: safeAuthUserSelect },
        },
      });
    }
    res.status(200).json({
      success: true,
      message: "Udated rental request status",
      data: updatedRequest,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Reject rental request by Brittoo
export const rejectRentalRequestAdmin = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { brittooRejectReason } = req.body;

    if (
      !brittooRejectReason ||
      typeof brittooRejectReason !== "string" ||
      brittooRejectReason.trim() === ""
    ) {
      return res.status(400).json({ error: "Reject reason is required" });
    }

    const rentalReq = await prisma.rentalRequest.findUnique({
      where: {
        id: requestId,
        deletedAt: null
      },
      include: {
        rccUsageDetails: {
          include: {
            redCacheCredit: true,
          },
        },
        bccWallet: true,
      },
    });
    if (!rentalReq) {
      throw new CustomError("Request not found", 404);
    }

    const updatedRequest = await prisma.$transaction(async (tx) => {
      const updates = [];

      // Handle BCC refund
      if (rentalReq.paidWithBcc && rentalReq.usedBccAmount && rentalReq.bccWalletId) {
        updates.push(
          tx.bccWallet.update({
            where: { id: rentalReq.bccWalletId },
            data: {
              availableBalance: { increment: rentalReq.usedBccAmount },
              lockedBalance: { decrement: rentalReq.usedBccAmount },
            },
          }),
        );
        updates.push(
          tx.bccTransaction.create({
            data: {
              userId: rentalReq.requesterId,
              walletId: rentalReq.bccWalletId,
              rentalRequestId: rentalReq.id,
              amount: rentalReq.usedBccAmount,
              status: "ACCEPTED",
              transactionType: "DEPOSIT_REFUND",
            },
          }),
        );
      }
      // Handle RCC refund
      if (rentalReq.paidWithRcc && rentalReq.rccUsageDetails.length > 0) {
        for (const usage of rentalReq.rccUsageDetails) {
          updates.push(
            tx.redCacheCredit.update({
              where: { id: usage.redCacheCreditId, deletedAt: null },
              data: {
                inUse: { decrement: usage.usedAmount },
              },
            }),
          );
        }
      }
      // Update rental request status
      updates.push(
        tx.rentalRequest.update({
          where: { id: requestId },
          data: {
            status: "REJECTED_FROM_BRITTOO",
            brittooRejectReason: brittooRejectReason
          },
          include: {
            product: true,
            owner: { select: safeAuthUserSelect },
            requester: { select: safeAuthUserSelect },
          },
        }),
      );

      const results = await Promise.all(updates);
      const updatedRequest = results[results.length - 1];
      return updatedRequest;
    });

    try {
          const title = 'Request Rejected 😓';
          const body = `Your rental request for product ${updatedRequest.product.name} has been rejected by Brittoo`;
          const data = { url: '/dashboard/placed-requests' };
          await createNotification(updatedRequest.requester.id, title, body, data);
        } catch (notificationError) {
          console.error("Failed to create notification in reject by brittoo:", notificationError);
        }


    res.status(200).json({
      success: true,
      message: "Rejected rental request by brittoo",
      data: updatedRequest,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
