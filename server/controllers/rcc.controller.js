import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";
import { Resend } from "resend";
import { createNotification } from "./notification.controller.js";
const resend = new Resend(`${process.env.RESEND_API_KEY}`);

export const getUsersAvailableRcc = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const availableRcc = await prisma.redCacheCredit.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        sourceProduct: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      message: "Successfully fetched accumulated Red Cache Credits",
      data: availableRcc
    });
  } catch (error) {
    console.error("Error in geUsersAvailableRcc controller: ", error);
    next(error);
  }
}

export const giftRcc = async (req, res, next) => {
  try {
    const {
      userId,
      amount,
      validityDays,
      giftReason = "",
    } = req.body;

    const adminId = req.user.id;
    if (!userId || !amount) {
      throw new CustomError('User ID and amount are required', 400)
    }
    if (parseInt(amount) <= 0) {
      throw new CustomError('Amount must be greater than 0', 400);
    }
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!targetUser) {
      throw new CustomError('User not found', 404);
    }
    const validityDate = validityDays ?
      new Date(Date.now() + (parseInt(validityDays) * 24 * 60 * 60 * 1000)) :
      null;

    const result = await prisma.$transaction(async (prismaTx) => {
      const virtualProduct = await prismaTx.product.create({
        data: {
          productSL: `GIFT-${Date.now()}`,
          name: `Gift Credit - ${amount} BDT`,
          productType: 'OTHERS',
          productCondition: 'NEW',
          productAge: 1,
          omv: parseInt(amount),
          secondHandPrice: parseInt(amount),
          tags: 'gift,credit,admin',
          productDescription: `Gift credit of ${amount} BDT`,
          quantity: 1,
          ownerId: adminId,
          isForSale: false,
          isVirtual: true,
          virtualType: 'GIFT_CREDIT',
          isBrittooVerified: true,
          pricePerDay: 0
        }
      });

      const giftRCC = await prismaTx.redCacheCredit.create({
        data: {
          amount: parseInt(amount),
          inUse: 0,
          userId: userId,
          sourceProductId: virtualProduct.id,
          isGiftCredit: true,
          validityDate: validityDate,
          giftReason,
          giftedBy: adminId
        }
      });

      return { virtualProduct, giftRCC };
    });


    try {
      const title = '🎉 You’ve Received Red Cache Credits!';
      const body = `Congratulations 🟥 You’ve just received ${amount} Red Cache Credits from Brittoo! Start your rental journey now and use your RCCs to rent anything you like.`;
      const data = { url: '/dashboard/my-credits' };

      await createNotification(targetUser.id, title, body, data);
    } catch (error) {
      console.error("Failed to create notification in gift rcc:", error);
    }


    res.status(201).json({
      success: true,
      message: 'Gift credit successfully added to user account',
      data: result.giftRCC
    });
  } catch (error) {
    console.error('Gift credit error:', error);
    next(error);
  }
}