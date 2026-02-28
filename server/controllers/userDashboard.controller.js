import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";
import { safeAuthUserSelect } from "../lib/prismaSelects.js";

export const getUserOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: safeAuthUserSelect,
    });

    if (!user) {
      throw new CustomError("User not found", 404, "NOT_FOUND")
    }
    // Get wallet information
    const wallet = await prisma.bccWallet.findUnique({
      where: { userId },
      select: {
        availableBalance: true,
        lockedBalance: true,
      },
    });
    // Get rental statistics
    const [
      activeRentalsCount,
      productsListedCount,
      totalRccCredits,
      pendingIncomingRequests,
      pendingOutgoingRequests,
      recentTransactions,
    ] = await Promise.all([
      // Active rentals (as a renter)
      prisma.rentalRequest.count({
        where: {
          requesterId: userId,
          status: {
            in: ["PRODUCT_COLLECTED_BY_RENTER", "PRODUCT_SUBMITTED_BY_OWNER"],
          },
        },
      }),
      // Products listed by user
      prisma.product.count({
        where: {
          ownerId: userId,
          deletedAt: null,
        },
      }),
      // Total RCC credits
      prisma.redCacheCredit.aggregate({
        where: {
          userId,
          deletedAt: null,
        },
        _sum: {
          amount: true,
        },
      }),
      // Pending incoming rental requests (as owner)
      prisma.rentalRequest.findMany({
        where: {
          ownerId: userId,
          status: "REQUESTED_BY_RENTER",
          deletedAt: null,
        },
        select: {
          id: true,
          createdAt: true,
          product: {
            select: {
              name: true,
            },
          },
          requester: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
      // Pending outgoing rental requests (as renter)
      prisma.rentalRequest.findMany({
        where: {
          requesterId: userId,
          status: {
            in: ["REQUESTED_BY_RENTER", "ACCEPTED_BY_OWNER"],
          },
          deletedAt: null,
        },
        select: {
          id: true,
          createdAt: true,
          status: true,
          product: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
      // Recent BCC transactions
      prisma.bccTransaction.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        select: {
          id: true,
          amount: true,
          transactionType: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
    ]);

    // Format recent activity
    const recentActivity = [];
    // Add recent transactions to activity
    recentTransactions.forEach((transaction) => {
      recentActivity.push({
        title: formatTransactionActivity(
          transaction.transactionType,
          transaction.amount,
        ),
        time: formatTimeAgo(transaction.createdAt),
        type: "transaction",
      });
    });
    // Add recent rental activities
    [...pendingIncomingRequests, ...pendingOutgoingRequests].forEach(
      (request) => {
        const isIncoming = pendingIncomingRequests.includes(request);
        recentActivity.push({
          title: isIncoming
            ? `New rental request for ${request.product.name}`
            : `Rental request sent for ${request.product.name}`,
          time: formatTimeAgo(request.createdAt),
          type: "rental",
        });
      },
    );
    // Sort activity by time and limit to 5
    recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));
    const limitedActivity = recentActivity.slice(0, 5);
    // Format pending requests
    const pendingRequests = [
      ...pendingIncomingRequests.map((req) => ({
        id: req.id,
        productName: req.product.name,
        type: "incoming",
        time: formatTimeAgo(req.createdAt),
        requesterName: req.requester.name,
      })),
      ...pendingOutgoingRequests.map((req) => ({
        id: req.id,
        productName: req.product.name,
        type: "outgoing",
        time: formatTimeAgo(req.createdAt),
        status: req.status,
      })),
    ];
    const dashboardData = {
      user,
      wallet,
      stats: {
        activeRentals: activeRentalsCount,
        productsListed: productsListedCount,
        totalRccCredits: totalRccCredits._sum.amount || 0,
        pendingRequestsCount: pendingRequests.length,
      },
      recentActivity: limitedActivity,
      pendingRequests: pendingRequests.slice(0, 5),
    };

    res.json({
      success: true,
      message: "User dash data fetched successfully",
      data: dashboardData,
    });
  } catch (error) {
    console.error("Error fetching user dashboard overview:", error);
    next(error);
  }
};

/**
 * Helper function to format transaction activity
 * @param {string} transactionType
 * @param {number} amount
 * @returns {string}
 */
const formatTransactionActivity = (transactionType, amount) => {
  const typeMap = {
    RENT_DEPOSIT: `Rent deposit of ${amount} BCC`,
    DEPOSIT_REFUND: `Refund of ${amount} BCC received`,
    BONUS_CREDIT: `Bonus credit of ${amount} BCC`,
    PURCHASE_BCC: `Purchased ${amount} BCC`,
    MONEY_WITHDRAWAL: `Withdrew ${amount} BCC`,
    ADJUSTMENT: `Account adjustment of ${amount} BCC`,
  };
  return typeMap[transactionType] || `Transaction of ${amount} BCC`;
};

/**
 * Helper function to format time ago
 * @param {Date} date
 * @returns {string}
 */
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};

export const getUserCreditHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [
      bccWallet,
      redCacheCredits,
      bccTransactions,
      pendingBccRequests,
      rentalHistory,
    ] = await Promise.all([
      prisma.bccWallet.findUnique({
        where: { userId },
      }),
      prisma.redCacheCredit.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        include: {
          sourceProduct: {
            select: {
              id: true,
              name: true,
              productSL: true,
             
              optimizedImages: true,
              pricePerDay: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.bccTransaction.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        select: {
          id: true,
          amount: true,
          rentalRequestId: true,
          paymentGateway: true,
          transactionId: true,
          transactionType: true,
          status: true,
          rejectReason: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.bccTransaction.findMany({
        where: {
          status: "PENDING",
          transactionType: "PURCHASE_BCC",
          deletedAt: null,
        },
        include: {
          user: {
            select: safeAuthUserSelect,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.rentalRequest.findMany({
        where: {
          requesterId: userId,
          deletedAt: null,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              pricePerDay: true,
              productSL: true,
             
              optimizedImages: true,
            },
          },
          rccUsageDetails: {
            include: {
              redCacheCredit: {
                include: {
                  sourceProduct: {
                    select: {
                      id: true,
                      name: true,
                      productSL: true,
                      pricePerDay: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    const totalRccAmount = redCacheCredits.reduce(
      (sum, rcc) => sum + rcc.amount,
      0,
    );
    const totalRccInUse = redCacheCredits.reduce(
      (sum, rcc) => sum + rcc.inUse,
      0,
    );
    const availableRccAmount = totalRccAmount - totalRccInUse;

    const totalBccSpent = bccTransactions
      .filter(
        (tx) =>
          tx.transactionType === "RENT_DEPOSIT" && tx.status === "ACCEPTED",
      )
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalBccPurchased = bccTransactions
      .filter(
        (tx) => tx.transactionType === "PURCHASE" && tx.status === "ACCEPTED",
      )
      .reduce((sum, tx) => sum + tx.amount, 0);

    const completedRentals = rentalHistory.filter(
      (rental) => rental.status === "PRODUCT_RETURNED_TO_OWNER",
    ).length;

    const totalRentalsValue = rentalHistory.reduce(
      (sum, rental) => sum + (rental.usedBccAmount || 0),
      0,
    );

    const rccUsageByProduct = {};
    rentalHistory.forEach((rental) => {
      rental.rccUsageDetails.forEach((usage) => {
        const productId = usage.redCacheCredit.sourceProduct.id;
        const productName = usage.redCacheCredit.sourceProduct.name;

        if (!rccUsageByProduct[productId]) {
          rccUsageByProduct[productId] = {
            productName,
            totalUsed: 0,
            usageCount: 0,
          };
        }

        rccUsageByProduct[productId].totalUsed += usage.usedAmount;
        rccUsageByProduct[productId].usageCount += 1;
      });
    });

    const dashboardData = {
      bccWallet,
      redCacheCredits,
      bccTransactions,
      rentalHistory,
      summary: {
        bcc: {
          lockedBalance: bccWallet?.lockedBalance || 0,
          availableBalance: bccWallet?.availableBalance,
          totalPurchased: totalBccPurchased,
          totalSpent: totalBccSpent,
          pendingBccRequests,
          totalPendingBcc: pendingBccRequests.reduce(
            (sum, bcc) => sum + bcc.amount,
            0,
          ),
        },
        rcc: {
          totalAmount: totalRccAmount,
          totalInUse: totalRccInUse,
          availableAmount: availableRccAmount,
          totalCredits: redCacheCredits.length,
          usageByProduct: rccUsageByProduct,
        },
        rentals: {
          totalRentals: rentalHistory.length,
          completedRentals,
          totalValue: totalRentalsValue,
          averageRentalValue:
            rentalHistory.length > 0
              ? totalRentalsValue / rentalHistory.length
              : 0,
        },
      },
    };

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Error fetching credit history:", error);
    next(error);
  }
};
