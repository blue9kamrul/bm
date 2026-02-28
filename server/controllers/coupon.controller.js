import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";

export const createCoupon = async (req, res, next) => {
  try {
    const { code, discount, expiresAt } = req.body;
    if (!code || !discount || !expiresAt) {
      throw new CustomError("Code, discount, and expiration date are required", 400);
    }
    const expirationDate = new Date(expiresAt);
    if (expirationDate <= new Date()) {
      throw new CustomError("Expiration date must be in the future", 400);
    }
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code }
    });
    if (existingCoupon) {
      throw new CustomError("Coupon code already exists", 400);
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discount: parseInt(discount),
        expiresAt: expirationDate,
        isActive: true
      }
    });
    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    next(error);
  }
};

export const deactivateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new CustomError("Coupon ID is required", 400);
    }
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id }
    });
    if (!existingCoupon) {
      throw new CustomError("Coupon not found", 404);
    }
    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: { isActive: false }
    });

    res.status(200).json({
      success: true,
      message: "Coupon deactivated successfully",
      data: updatedCoupon
    });

  } catch (error) {
    console.error('Deactivate coupon error:', error);
    next(error);
  }
};

export const activateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new CustomError("Coupon ID is required", 400);
    }
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id }
    });
    if (!existingCoupon) {
      throw new CustomError("Coupon not found", 404);
    }

    if (existingCoupon.expiresAt <= new Date()) {
      throw new CustomError("Cannot activate expired coupon", 400);
    }
    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: { isActive: true }
    });

    res.status(200).json({
      success: true,
      message: "Coupon activated successfully",
      data: updatedCoupon
    });

  } catch (error) {
    console.error('Activate coupon error:', error);
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new CustomError("Coupon ID is required", 400);
    }
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        rentalRequests: true
      }
    });

    if (!existingCoupon) {
      throw new CustomError("Coupon not found", 404);
    }

    // Check if coupon is being used in any rental requests
    if (existingCoupon.rentalRequests.length > 0) {
      throw new CustomError("Cannot delete coupon that has been used in rental requests", 400);
    }

    await prisma.coupon.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully"
    });

  } catch (error) {
    console.error('Delete coupon error:', error);
    next(error);
  }
};

export const getAllCoupons = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Get coupons with pagination
    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        include: {
          _count: {
            select: { rentalRequests: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.coupon.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: {
        coupons,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / take),
          totalItems: total,
          itemsPerPage: take
        }
      }
    });

  } catch (error) {
    console.error('Get coupons error:', error);
    next(error);
  }
};

export const getCouponById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new CustomError("Coupon ID is required", 400);
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        rentalRequests: {
          select: {
            id: true,
            createdAt: true
          }
        },
        _count: {
          select: { rentalRequests: true }
        }
      }
    });

    if (!coupon) {
      throw new CustomError("Coupon not found", 404);
    }

    res.status(200).json({
      success: true,
      data: coupon
    });

  } catch (error) {
    console.error('Get coupon error:', error);
    next(error);
  }
};


export const validateCoupon = async (req, res, next) => {
  try {
    const { code, userId } = req.params;

    if (!code || !userId) {
      throw new CustomError("Coupon code and user ID are required", 400);
    }

    const coupon = await prisma.coupon.findUnique({
      where: { 
        code: code.toUpperCase() 
      },
      include: {
        rentalRequests: {
          where: {
            requesterId: userId
          },
          select: {
            id: true,
            createdAt: true,
            requesterId: true
          }
        }
      }
    });

    // Check if coupon exists
    if (!coupon) {
      return res.status(200).json({
        success: true,
        message: "Coupon not found",
        valid: false
      });
    }

    // Check if coupon is expired
    if (new Date(coupon.expiresAt) <= new Date()) {
      return res.status(200).json({
        success: true,
        message: "Coupon has expired",
        valid: false
      });
    }

    // Check if user has used this coupon more than 2 times
    const userUsageCount = coupon.rentalRequests.length;
    if (userUsageCount >= 2) {
      return res.status(200).json({
        success: true,
        message: "You have already used this coupon the maximum number of times (2)",
        valid: false,
        usageCount: userUsageCount
      });
    }

    // Coupon is valid - return coupon data without sensitive info
    const { rentalRequests, ...couponData } = coupon;
    
    res.status(200).json({
      success: true,
      message: "Coupon is valid",
      valid: true,
      usageCount: userUsageCount,
      remainingUses: 2 - userUsageCount,
      data: couponData
    });

  } catch (error) {
    console.error('Validate coupon error:', error);
    next(error);
  }
};