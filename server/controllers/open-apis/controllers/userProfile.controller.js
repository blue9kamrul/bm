import prisma from "../../../config/prisma.js";


export const getSocialProfile = async (req, res) => {
  try {
    const { identifier } = req.params;

    // Find user by ID or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: identifier },
          { email: identifier }
        ],
        deletedAt: null,
        isSuspended: false // Don't expose suspended users
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        isVerified: true,
        securityScore: true,
        suspensionCount: true,
        createdAt: true,
        // Relations for calculations
        rentalRequestsMade: {
          where: {
            deletedAt: null,
            status: {
              in: [
                'ACCEPTED_BY_OWNER',
                'PRODUCT_SUBMITTED_BY_OWNER',
                'PRODUCT_COLLECTED_BY_RENTER',
                'PRODUCT_RETURNED_BY_RENTER',
                'PRODUCT_RETURNED_TO_OWNER'
              ]
            }
          },
          select: {
            id: true,
            status: true,
            createdAt: true
          }
        },
        rentalRequestsReceived: {
          where: {
            deletedAt: null,
            status: {
              in: [
                'ACCEPTED_BY_OWNER',
                'PRODUCT_SUBMITTED_BY_OWNER',
                'PRODUCT_COLLECTED_BY_RENTER',
                'PRODUCT_RETURNED_BY_RENTER',
                'PRODUCT_RETURNED_TO_OWNER'
              ]
            }
          },
          select: {
            id: true,
            status: true,
            createdAt: true
          }
        },
        bccTransactions: {
          where: {
            deletedAt: null,
            status: 'ACCEPTED'
          },
          select: {
            id: true,
            amount: true,
            transactionType: true,
            createdAt: true
          }
        },
        rentedOutProducts: {
          where: {
            deletedAt: null
          },
          select: {
            id: true,
            createdAt: true
          }
        },
        purchaseRequestsMade: {
          where: {
            deletedAt: null,
            status: {
              in: ['ACCEPTED_BY_SELLER', 'PRODUCT_SUBMITTED_BY_SELLER', 'PRODUCT_COLLECTED_BY_BUYER']
            }
          },
          select: {
            id: true
          }
        },
        purchaseRequestsReceived: {
          where: {
            deletedAt: null,
            status: {
              in: ['ACCEPTED_BY_SELLER', 'PRODUCT_SUBMITTED_BY_SELLER', 'PRODUCT_COLLECTED_BY_BUYER']
            }
          },
          select: {
            id: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or profile unavailable"
      });
    }

    // Calculate metrics
    const totalRentalsAsRenter = user.rentalRequestsMade.length;
    const totalRentalsAsOwner = user.rentalRequestsReceived.length;
    const completedRentalsAsRenter = user.rentalRequestsMade.filter(
      r => r.status === 'PRODUCT_RETURNED_TO_OWNER'
    ).length;
    const completedRentalsAsOwner = user.rentalRequestsReceived.filter(
      r => r.status === 'PRODUCT_RETURNED_TO_OWNER'
    ).length;

    const totalTransactions = user.bccTransactions.length;
    const totalTransactionVolume = user.bccTransactions.reduce(
      (sum, txn) => sum + txn.amount, 0
    );

    const totalListedProducts = user.rentedOutProducts.length;
    
    const totalPurchasesCompleted = user.purchaseRequestsMade.length + user.purchaseRequestsReceived.length;

    // Calculate account age in days
    const accountAgeInDays = Math.floor(
      (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
    );

    // Calculate completion rate
    const totalRentalEngagements = totalRentalsAsRenter + totalRentalsAsOwner;
    const completedRentals = completedRentalsAsRenter + completedRentalsAsOwner;
    const rentalCompletionRate = totalRentalEngagements > 0 
      ? ((completedRentals / totalRentalEngagements) * 100).toFixed(2)
      : 0;

    // Build social profile
    const socialProfile = {
      userId: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      verificationStatus: user.isVerified,
      securityScore: user.securityScore,
      
      // Trust indicators
      accountAgeInDays,
      suspensionCount: user.suspensionCount,
      
      // Rental activity
      rentalEngagement: {
        totalAsRenter: totalRentalsAsRenter,
        totalAsOwner: totalRentalsAsOwner,
        completedAsRenter: completedRentalsAsRenter,
        completedAsOwner: completedRentalsAsOwner,
        totalEngagements: totalRentalEngagements,
        completionRate: parseFloat(rentalCompletionRate)
      },
      
      // Financial activity
      financialActivity: {
        totalTransactions,
        totalTransactionVolume,
        averageTransactionValue: totalTransactions > 0 
          ? Math.round(totalTransactionVolume / totalTransactions)
          : 0
      },
      
      // Marketplace activity
      marketplaceActivity: {
        totalListedProducts,
        totalPurchasesCompleted
      },

      // Overall trust score (0-100)
      trustScore: calculateTrustScore({
        securityScore: user.securityScore,
        emailVerified: user.emailVerified,
        isVerified: user.isVerified,
        suspensionCount: user.suspensionCount,
        accountAgeInDays,
        completionRate: parseFloat(rentalCompletionRate),
        totalEngagements: totalRentalEngagements,
        totalTransactions
      }),

      generatedAt: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      data: socialProfile
    });

  } catch (error) {
    console.error("Error fetching social profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch social profile",
      error: error.message
    });
  }
};

// Helper function to calculate trust score
function calculateTrustScore(metrics) {
  let score = 0;

  // Security score contribution (30 points)
  const securityScoreMap = {
    'VERY_HIGH': 30,
    'HIGH': 25,
    'MID': 20,
    'LOW': 10,
    'VERY_LOW': 5
  };
  score += securityScoreMap[metrics.securityScore] || 0;

  // Verification contribution (20 points)
  if (metrics.emailVerified) score += 10;
  if (metrics.isVerified === 'VERIFIED') score += 10;
  else if (metrics.isVerified === 'PENDING') score += 5;

  // Account age contribution (15 points)
  if (metrics.accountAgeInDays > 365) score += 15;
  else if (metrics.accountAgeInDays > 180) score += 12;
  else if (metrics.accountAgeInDays > 90) score += 8;
  else if (metrics.accountAgeInDays > 30) score += 5;

  // Completion rate contribution (20 points)
  if (metrics.completionRate >= 95) score += 20;
  else if (metrics.completionRate >= 85) score += 15;
  else if (metrics.completionRate >= 70) score += 10;
  else if (metrics.completionRate >= 50) score += 5;

  // Activity contribution (10 points)
  if (metrics.totalEngagements > 50) score += 10;
  else if (metrics.totalEngagements > 20) score += 7;
  else if (metrics.totalEngagements > 10) score += 5;
  else if (metrics.totalEngagements > 5) score += 3;

  // Transaction contribution (5 points)
  if (metrics.totalTransactions > 20) score += 5;
  else if (metrics.totalTransactions > 10) score += 3;
  else if (metrics.totalTransactions > 5) score += 2;

  // Penalty for suspensions
  score -= (metrics.suspensionCount * 10);

  // Ensure score is between 0-100
  return Math.max(0, Math.min(100, score));
}