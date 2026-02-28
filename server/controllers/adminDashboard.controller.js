import prisma from "../config/prisma.js";
import redisClient from "../config/redis.js";
import { CustomError } from "../lib/customError.js";

export const holdProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { status } = req.body;
    if (!productId) {
      throw new CustomError("Product Id Required", 400);
    }
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        deletedAt: null
      }
    });
    if (!product) {
      throw new CustomError("Product Not Found", 404);
    }
    const updateHoldBool = status === 'HOLD';
    const updatedProduct = await prisma.product.update({
      where: {
        id: productId
      },
      data: {
        isOnHold: updateHoldBool
      }
    });
    const keys = await redisClient.keys("products:*");
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log("Cache invalidated:", keys);
    }
    res.status(200).json({
      success: true,
      message: "Product Hold Successfull",
      data: updatedProduct
    })
  } catch (error) {
    console.error(error);
    next(error);
  }
}


export const getAnalytics = async (req, res) => {
  try {
    // Get date range for 2 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 2);

    // 1. User Registration Timeline (past 2 months, grouped by 5-day intervals)
    const userRegistrations = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        deletedAt: null,
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by 5-day intervals
    const registrationData = [];
    const intervalMap = new Map();

    userRegistrations.forEach(registration => {
      const date = new Date(registration.createdAt);
      const dayOfYear = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
      const intervalKey = Math.floor(dayOfYear / 5) * 5;

      if (!intervalMap.has(intervalKey)) {
        const intervalStart = new Date(startDate);
        intervalStart.setDate(intervalStart.getDate() + intervalKey);
        intervalMap.set(intervalKey, {
          date: intervalStart.toISOString().split('T')[0],
          users: 0,
        });
      }

      intervalMap.get(intervalKey).users += registration._count.id;
    });

    intervalMap.forEach(value => registrationData.push(value));

    // 2. Product Type Distribution
    const productTypeData = await prisma.product.groupBy({
      by: ['productType'],
      where: {
        deletedAt: null,
        isVirtual: false,
      },
      _count: {
        id: true,
      },
    });

    const productDistribution = productTypeData.map(item => ({
      type: item.productType,
      count: item._count.id,
    }));

    // 3. Rental Requests Timeline (daily for past 2 months)
    const rentalRequestsData = await prisma.rentalRequest.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        deletedAt: null,
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by day
    const requestsTimeline = [];
    const dailyMap = new Map();

    rentalRequestsData.forEach(request => {
      const dateKey = new Date(request.createdAt).toISOString().split('T')[0];

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          date: dateKey,
          requests: 0,
        });
      }

      dailyMap.get(dateKey).requests += request._count.id;
    });

    dailyMap.forEach(value => requestsTimeline.push(value));

    // 4. Revenue Analysis (past 2 months)
    const revenueData = await prisma.rentalRequest.findMany({
      where: {
        status: {
          in: [
            'PRODUCT_COLLECTED_BY_RENTER',
            'PRODUCT_RETURNED_BY_RENTER',
            'PRODUCT_RETURNED_TO_OWNER',
          ],
        },
        deletedAt: null,
      },
      select: {
        createdAt: true,
        pricePerDay: true,
        pricePerHour: true,
        totalDays: true,
        totalHours: true,
        isHourlyRental: true,
        product: {
          select: {
            pricePerDay: true,
          },
        },
      },
    });


    const revenueTimeline = [];
    const revenueMap = new Map();

    revenueData.forEach(rental => {
      const dateKey = new Date(rental.createdAt).toISOString().split('T')[0];
      let revenue = 0;

      if (rental.isHourlyRental && rental.pricePerHour && rental.totalHours) {
        revenue = parseFloat(rental.pricePerHour) * rental.totalHours;
      } else {
        if (rental.pricePerDay) {
          revenue = parseFloat(rental.pricePerDay) * rental.totalDays;
        } else {
          revenue = parseFloat(rental.product.pricePerDay) * rental.totalDays;
        }

      }

      if (!revenueMap.has(dateKey)) {
        revenueMap.set(dateKey, {
          date: dateKey,
          revenue: 0,
        });
      }

      revenueMap.get(dateKey).revenue += revenue;
    });

    revenueMap.forEach(value => revenueTimeline.push(value));

    // 5. Popular Products (only products with rentals)
    const popularProducts = await prisma.rentalRequest.groupBy({
      by: ['productId'],
      where: {
        status: {
          in: ['PRODUCT_COLLECTED_BY_RENTER', 'PRODUCT_RETURNED_BY_RENTER', 'PRODUCT_RETURNED_TO_OWNER'],
        },
        deletedAt: null,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Get product names for the popular products
    const productIds = popularProducts.map(p => p.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const popularProductsData = popularProducts.map(rental => {
      const product = products.find(p => p.id === rental.productId);
      return {
        name: product?.name || 'Unknown Product',
        rentals: rental._count.id,
      };
    });

    // 6. Rental Duration Analysis
    const rentalDurations = await prisma.rentalRequest.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        totalDays: true,
      },
    });

    // Group by duration ranges
    const durationRanges = {
      '1 day': 0,
      '2-3 days': 0,
      '4-7 days': 0,
      '1-2 weeks': 0,
      '2+ weeks': 0,
    };

    rentalDurations.forEach(rental => {
      const days = rental.totalDays;
      if (days === 1) {
        durationRanges['1 day']++;
      } else if (days >= 2 && days <= 3) {
        durationRanges['2-3 days']++;
      } else if (days >= 4 && days <= 7) {
        durationRanges['4-7 days']++;
      } else if (days >= 8 && days <= 14) {
        durationRanges['1-2 weeks']++;
      } else if (days > 14) {
        durationRanges['2+ weeks']++;
      }
    });

    const durationData = Object.entries(durationRanges).map(([range, count]) => ({
      duration: range,
      count,
    }));

    // 7. User Document Upload Status
    const documentStatus = await prisma.user.groupBy({
      by: ['selfie', 'idCardFront'],
      where: {
        deletedAt: null,
      },
      _count: {
        id: true,
      },
    });

    let withDocuments = 0;
    let withoutDocuments = 0;

    documentStatus.forEach(status => {
      if (status.selfie && status.idCardFront) {
        withDocuments += status._count.id;
      } else {
        withoutDocuments += status._count.id;
      }
    });

    const documentUploadData = [
      { status: 'With Documents', count: withDocuments },
      { status: 'Without Documents', count: withoutDocuments },
    ];

    // Response
    res.json({
      success: true,
      data: {
        userRegistrations: registrationData,
        productDistribution,
        rentalRequestsTimeline: requestsTimeline,
        revenueTimeline,
        popularProducts: popularProductsData,
        rentalDurations: durationData,
        documentUploadStatus: documentUploadData,
      },
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: error.message,
    });
  }
};