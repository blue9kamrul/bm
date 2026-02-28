import { Resend } from "resend";
import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";
import { safeAuthUserSelect } from "../lib/prismaSelects.js";
import { createNotification } from "./notification.controller.js";
const resend = new Resend(`${process.env.RESEND_API_KEY}`);

export const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "ALL",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {
      AND: [
        { deletedAt: null },
        search
          ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { roll: { contains: search, mode: "insensitive" } },
            ],
          }
          : {},

        status === "VERIFIED"
          ? { isVerified: "VERIFIED" }
          : status === "PENDING"
            ? { isVerified: "PENDING" }
            : status === "UNVERIFIED"
              ? { isVerified: "UNVERIFIED" }
              : status === "SUSPENDED"
                ? { isSuspended: true }
                : {},
      ],
    };

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: safeAuthUserSelect,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const stats = await prisma.user.groupBy({
      by: ["isVerified", "brittooVerified", "isSuspended"],
      _count: true,
      where: { deletedAt: null },
    });

    const summary = {
      totalUsers,
      verified: stats
        .filter((s) => s.isVerified === "VERIFIED")
        .reduce((acc, s) => acc + s._count, 0),
      pending: stats
        .filter((s) => s.isVerified === "PENDING")
        .reduce((acc, s) => acc + s._count, 0),
      unverified: stats
        .filter((s) => s.isVerified === "UNVERIFIED")
        .reduce((acc, s) => acc + s._count, 0),
      brittooVerified: stats
        .filter((s) => s.brittooVerified === true)
        .reduce((acc, s) => acc + s._count, 0),
      suspended: stats
        .filter((s) => s.isSuspended === true)
        .reduce((acc, s) => acc + s._count, 0),
    };

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / parseInt(limit)),
          totalUsers,
          limit: parseInt(limit),
        },
        summary,
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    next(error);
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: {
        bccWallet: {
          include: {
            bccTransactions: {
              orderBy: { createdAt: "desc" },
              take: 50,
            },
          },
        },
        bccTransactions: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        redCacheCredits: {
          orderBy: { createdAt: "desc" },
          include: {
            sourceProduct: {
              select: {
                id: true,
                name: true,
                productType: true,
              },
            },
            rentalRequestUsages: {
              include: {
                rentalRequest: {
                  select: {
                    id: true,
                    status: true,
                    rentalStartDate: true,
                    rentalEndDate: true,
                    product: {
                      select: {
                        name: true,
                        productType: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        rentedOutProducts: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            productType: true,
            productCondition: true,
            pricePerDay: true,
            isOnHold: true,
            isRented: true,
            isBrittooVerified: true,
            createdAt: true,
            updatedAt: true,
            renters: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        borrowedProducts: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            productType: true,
            productCondition: true,
            pricePerDay: true,
            createdAt: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        rentalRequestsMade: {
          select: {
            id: true,
            status: true,
            submissionDeadline: true,
            rentalStartDate: true,
            rentalEndDate: true,
            totalDays: true,
            usedBccAmount: true,
            paidWithRcc: true,
            paidWithBcc: true,
            createdAt: true,
            updatedAt: true,
            product: {
              select: {
                id: true,
                name: true,
                productType: true,
                pricePerDay: true,
                owner: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        rentalRequestsReceived: {
          select: {
            id: true,
            status: true,
            submissionDeadline: true,
            rentalStartDate: true,
            rentalEndDate: true,
            totalDays: true,
            usedBccAmount: true,
            paidWithRcc: true,
            paidWithBcc: true,
            createdAt: true,
            updatedAt: true,
            product: {
              select: {
                id: true,
                name: true,
                productType: true,
                pricePerDay: true,
              },
            },
            requester: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    // Calculate wallet and credit summary
    const walletSummary = {
      availableBalance: user.bccWallet?.availableBalance || 0,
      lockedBalance: user.bccWallet?.lockedBalance || 0,
      totalBalance:
        (user.bccWallet?.availableBalance || 0) +
        (user.bccWallet?.lockedBalance || 0),
    };

    const creditSummary = {
      totalRedCredits: user.redCacheCredits.reduce(
        (sum, c) => sum + c.amount,
        0,
      ),
      totalRedCreditsInUse: user.redCacheCredits.reduce(
        (sum, c) => sum + c.inUse,
        0,
      ),
      availableRedCredits: user.redCacheCredits.reduce(
        (sum, c) => sum + (c.amount - c.inUse),
        0,
      ),
    };

    // Calculate BCC transaction summary
    const bccTransactionSummary = {
      totalDeposits: user.bccTransactions
        .filter(
          (t) =>
            t.transactionType === "PURCHASE_BCC" && t.status === "ACCEPTED",
        )
        .reduce((sum, t) => sum + t.amount, 0),
      totalWithdrawals: user.bccTransactions
        .filter(
          (t) =>
            t.transactionType === "MONEY_WITHDRAWAL" && t.status === "ACCEPTED",
        )
        .reduce((sum, t) => sum + t.amount, 0),
      pendingTransactions: user.bccTransactions
        .filter((t) => t.status === "PENDING")
        .reduce((sum, t) => sum + t.amount, 0),
      rejectedTransactions: user.bccTransactions
        .filter((t) => t.status === "REJECTED")
        .reduce((sum, t) => sum + t.amount, 0),
    };

    // Calculate rental statistics
    const rentalStats = {
      totalRentalsCompleted: user.rentalRequestsMade.filter(
        (r) => r.status === "PRODUCT_RETURNED_TO_OWNER",
      ).length,
      totalRentalsActive: user.rentalRequestsMade.filter((r) =>
        ["PRODUCT_COLLECTED_BY_RENTER", "PRODUCT_SUBMITTED_BY_OWNER"].includes(
          r.status,
        ),
      ).length,
      totalRentalsCancelled: user.rentalRequestsMade.filter((r) =>
        [
          "CANCELLED_BY_RENTER",
          "REJECTED_BY_OWNER",
          "REJECTED_FROM_BRITTOO",
        ].includes(r.status),
      ).length,
      totalEarnings: user.rentalRequestsReceived
        .filter((r) => r.status === "PRODUCT_RETURNED_TO_OWNER")
        .reduce(
          (sum, r) => sum + r.totalDays * (r.product.pricePerDay || 0),
          0,
        ),
      totalSpent: user.rentalRequestsMade
        .filter((r) => r.status === "PRODUCT_RETURNED_TO_OWNER")
        .reduce(
          (sum, r) => sum + r.totalDays * (r.product.pricePerDay || 0),
          0,
        ),
    };

    // Location info
    const locationInfo = {
      hasLocation: !!(user.latitude && user.longitude),
      latitude: user.latitude ? parseFloat(user.latitude) : null,
      longitude: user.longitude ? parseFloat(user.longitude) : null,
      ipAddress: user.ipAddress,
    };

    // Document verification status
    const documentStatus = {
      hasSelfie: !!user.selfie,
      hasIdCardFront: !!user.idCardFront,
      hasIdCardBack: !!user.idCardBack,
      documentsComplete: !!(user.selfie && user.idCardFront),
    };

    res.json({
      success: true,
      data: {
        user,
        walletSummary,
        creditSummary,
        bccTransactionSummary,
        rentalStats,
        locationInfo,
        documentStatus,
        stats: {
          totalProductsRented: user.rentedOutProducts.length,
          totalProductsBorrowed: user.borrowedProducts.length,
          totalRequestsMade: user.rentalRequestsMade.length,
          totalRequestsReceived: user.rentalRequestsReceived.length,
        },
      },
    });
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user details",
      error: error.message,
    });
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        deletedAt: null,
      },
    });
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    if (user.isVerified === "VERIFIED") {
      throw new CustomError("User is already verified", 400);
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: "VERIFIED",
      },
    });

    try {
      const title = '✅ You’re Verified on Brittoo!';
      const body = `Congrats 🎉 Your documents have been successfully verified. You can now rent, lend, and explore all Brittoo features freely. Start your rental journey today!`;
      const data = { url: '' };
      await createNotification(updatedUser.id, title, body, data);
    } catch (error) {
      console.error("Failed to create notification in verify user:", error);
    }

    //send email
    await resend.emails.send({
      from: "Brittoo <verify@brittoo.xyz>",
      to: user.email,
      subject: "Congratulations! Your are verified from Brittoo.",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7f6;">
          <div style="text-align: center; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #2e7d32; font-size: 24px; margin-bottom: 20px;">You're Verified!</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Your Brittoo account has been successfully verified. You're all set to explore your dashboard.
            </p>
            <a href="${process.env.CLIENT_BASE_URL}/dashboard/overview" style="display: inline-block; padding: 12px 24px; background-color: #4caf50; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 5px; margin: 20px 0;">
              Go to Dashboard
            </a>
            <p style="color: #374151; font-size: 14px; line-height: 1.5;">
              If you have any questions, feel free to contact our support team.
            </p>
          </div>
      </div>
      `,
    });

    res.json({
      success: true,
      message: "User verification status updated successfully",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error("Verify user error:", error);
    next(error);
  }
};

export const suspendUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        deletedAt: null,
      },
    });
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    let updatedUser;
    if (user.isSuspended) {
      updatedUser = await prisma.user.update({
        where: {
          id: userId
        },
        data: {
          suspensionCount: user.suspensionCount + 1,
        },
      });
    } else {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          isSuspended: true,
          suspensionCount: 1,
        },
      });
    }

    try {
      let title, body;

      if (updatedUser.suspensionCount >= 3) {
        title = '🚫 Account Suspended – Maximum Limit Reached';
        body = `You’ve reached the maximum suspension limit ⚠️ and can no longer participate in any rental activities. For assistance, please contact Brittoo Support.`;
      } else {
        title = '⚠️ Suspension Notice from Brittoo';
        body = `You’ve received a suspension 🚫 due to policy violations. Be alert and follow our guidelines to avoid further action. Repeated suspensions may lead to account restrictions.`;
      }

      const data = { url: '' };
      await createNotification(updatedUser.id, title, body, data);
    } catch (error) {
      console.error("Failed to create notification in suspend user:", error);
    }


    res.json({
      success: true,
      message: "User suspended successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Suspend user error:", error);
    next(error);
  }
};

//admin dash data
export const getUserCreditHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;

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

export const getUserPlacedRequestsAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const placedRequests = await prisma.rentalRequest.findMany({
      where: {
        requesterId: userId,
        deletedAt: null,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,

            optimizedImages: true,
            pricePerDay: true,
            productType: true,
            productCondition: true,
            ownerId: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            securityScore: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: placedRequests,
      message: "Placed requests fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching placed requests:", error);
    next(error);
  }
};

export const getUserReceivedRequestsAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const rentalRequests = await prisma.rentalRequest.findMany({
      where: {
        ownerId: userId,
        deletedAt: null,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,

            optimizedImages: true,
            pricePerDay: true,
            productType: true,
            productCondition: true,
            omv: true,
          },
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            securityScore: true,
            emailVerified: true,
            isVerified: true,
            brittooVerified: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: rentalRequests,
      message: "Rental requests fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching rental requests:", error);
    next(error);
  }
};

export const getUserWithdrawalRequests = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      throw new CustomError("User id not provided", 400);
    }
    const usersWithdrawalRequests = await prisma.withdrawalRequest.findMany({
      where: {
        userId,
      },
      include: {
        wallet: true,
      },
    });
    res.status(201).json({
      success: true,
      message: "Withdrawal requests fetched successfully",
      data: usersWithdrawalRequests,
    });
  } catch (error) {
    console.error("Error in getUsersWithdrawalRequests controller: ", error);
    next(error);
  }
};

//user nav data
export const getUserTotalCredits = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [bccWallet, redCacheCredits] = await Promise.all([
      prisma.bccWallet.findUnique({
        where: { userId },
      }),
      prisma.redCacheCredit.findMany({
        where: {
          userId,
          deletedAt: null,
        },
      }),
    ]);
    const totalAvailableRcc = redCacheCredits.reduce(
      (sum, rcc) => sum + (rcc.amount - rcc.inUse),
      0,
    );
    const dashboardData = {
      totalAvailableBcc: bccWallet?.availableBalance || 0,
      totalAvailableRcc,
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
