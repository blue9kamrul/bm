import { Resend } from "resend";
import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";
import { isGiftCreditValid } from "../lib/creditValidators.js";
import { createNotification, notifyAdmins } from "./notification.controller.js";
const resend = new Resend(`${process.env.RESEND_API_KEY}`);

export const createRentalRequest = async (req, res, next) => {
  try {
    const {
      productId,
      requesterId,
      ownerId,
      rentalStartDate,
      rentalEndDate,
      totalDays,
      renterCollectionMethod,
      renterPhoneNumber,
      deliveryAddress,
      pickupPoint,
      paidWithBcc,
      bccWalletId,
      usedBccAmount,
      paidWithRcc,
      coupon,
      usedRccData = [],
      isHourlyRental,
      pricePerHour,
      totalHours,
      pricePerDay,
      startingHour
    } = req.body;

    if (!productId || !requesterId || !ownerId) {
      throw new CustomError("Missing required IDs", 400);
    }
    if (paidWithBcc && !bccWalletId) {
      throw new CustomError("Missing Bcc Wallet Id", 400);
    }
    if (!rentalStartDate || !rentalEndDate || !totalDays) {
      throw new CustomError("Missing rental period info", 400);
    }
    if (
      !renterCollectionMethod ||
      !renterPhoneNumber ||
      renterPhoneNumber.trim() === ""
    ) {
      throw new CustomError(
        "Missing collection method or valid phone number",
        400,
      );
    }
    if (renterCollectionMethod === "HOME" && !deliveryAddress) {
      throw new CustomError("Delivery address required for home delivery", 400);
    }
    if (renterCollectionMethod === "BRITTOO_TERMINAL" && !pickupPoint) {
      throw new CustomError("Pickup point required for terminal pickup", 400);
    }

    // Product validation
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        owner: true,
        rentalRequests: {
          where: {
            status: {
              in: [
                "ACCEPTED_BY_OWNER",
                "PRODUCT_SUBMITTED_BY_OWNER",
                "PRODUCT_COLLECTED_BY_RENTER",
                "PRODUCT_RETURNED_BY_RENTER",
              ]
            }
          }
        }
      },
    });
    if (!product) {
      throw new CustomError("Product not found", 404);
    }
    if (product.isRented) {
      throw new CustomError("Product is already rented", 400);
    }
    if (product.rentalRequests.length > 0) {
      throw new CustomError("Product is already rented", 400);
    }
    // if (product.isOnHold) {
    //   throw new CustomError("Product is currently on hold", 400);
    // }
    if (requesterId === ownerId) {
      throw new CustomError("Cannot rent your own product", 400);
    }

    // Check for existing pending request
    const existingRequest = await prisma.rentalRequest.findFirst({
      where: {
        productId,
        requesterId,
        status: "REQUESTED_BY_RENTER",
      },
    });
    if (existingRequest) {
      throw new CustomError(
        "You already have a pending request for this product",
        400,
      );
    }

    // Validate Bcc
    if (paidWithBcc) {
      const bccWallet = await prisma.bccWallet.findUnique({
        where: { id: bccWalletId },
      });
      if (!bccWallet) {
        throw new CustomError("BCC Wallet not found", 404);
      }
      if (bccWallet.userId !== requesterId) {
        throw new CustomError("BCC Wallet does not belong to requester", 403);
      }
      const availableBalance = bccWallet.availableBalance;
      if (availableBalance < usedBccAmount) {
        throw new CustomError("Insufficient BCC balance", 400);
      }
    }

    // Validate Rcc
    if (paidWithRcc && usedRccData.length > 0) {
      const rccIds = usedRccData.map((item) => item.rccId);
      const rccCredits = await prisma.redCacheCredit.findMany({
        where: {
          id: { in: rccIds },
          userId: requesterId,
          deletedAt: null
        },
      });
      if (rccCredits.length !== rccIds.length) {
        throw new CustomError(
          "Some RCC credits not found or don't belong to requester",
          400,
        );
      }
      // Validate each RCC credit has sufficient balance
      for (const rccUsage of usedRccData) {
        const rccCredit = rccCredits.find((rcc) => rcc.id === rccUsage.rccId);
        const availableAmount = rccCredit.amount - rccCredit.inUse;
        if (availableAmount < rccUsage.selectedAmount) {
          throw new CustomError(
            `Insufficient RCC credit balance for credit ID: ${rccUsage.rccId}`,
            400,
          );
        }
        // Check if gift credit is currently valid
        if (rccCredit.isGiftCredit && !isGiftCreditValid(rccCredit)) {
          throw new CustomError(
            `Gift credit has expired and cannot be used`,
            400
          );
        }
        // IMPORTANT: Check if gift credit will expire during rental period
        if (rccCredit.isGiftCredit && !isGiftCreditValid(rccCredit, rentalEndDate)) {
          throw new CustomError(
            `Gift credit will expire during the rental period (${new Date(rccCredit.validityDate).toLocaleDateString()}). Please choose a different payment method or shorter rental period.`,
            400
          );
        }
      }
    }

    const rentalStart = new Date(rentalStartDate);
    const submissionDeadline = new Date(
      rentalStart.getTime() - 4 * 60 * 60 * 1000,
    );

    const result = await prisma.$transaction(async (tx) => {
      const rentalRequest = await tx.rentalRequest.create({
        data: {
          productId,
          requesterId,
          ownerId,
          couponId: coupon ? coupon.id : null,
          bccWalletId: paidWithBcc ? bccWalletId : null,
          rentalStartDate: new Date(rentalStartDate),
          rentalEndDate: new Date(rentalEndDate),
          submissionDeadline,
          totalDays,

          renterCollectionMethod,
          renterPhoneNumber,
          renterDeliveryAddress:
            renterCollectionMethod === "HOME" ? deliveryAddress : null,
          renterPickupTerminal:
            renterCollectionMethod === "BRITTOO_TERMINAL" ? pickupPoint : null,
          paidWithBcc,
          usedBccAmount: paidWithBcc ? usedBccAmount : null,
          paidWithRcc,
          status: "REQUESTED_BY_RENTER",
          //new
          isHourlyRental,
          pricePerDay,
          pricePerHour,
          totalHours,
          startingHour,
        },
        include: {
          product: true,
          requester: true,
          owner: true,
        },
      });

      if (paidWithBcc && usedBccAmount > 0) {
        await tx.bccTransaction.create({
          data: {
            userId: requesterId,
            walletId: bccWalletId,
            rentalRequestId: rentalRequest.id,
            amount: usedBccAmount,
            transactionType: "RENT_DEPOSIT",
          },
        });
        await tx.bccWallet.update({
          where: { id: bccWalletId },
          data: {
            lockedBalance: {
              increment: usedBccAmount,
            },
            availableBalance: {
              decrement: usedBccAmount,
            },
          },
        });
      }

      if (paidWithRcc && usedRccData.length > 0) {
        for (const rccUsage of usedRccData) {
          await tx.redCacheCredit.update({
            where: {
              id: rccUsage.rccId,
              deletedAt: null
            },
            data: {
              inUse: {
                increment: rccUsage.selectedAmount,
              },
            },
          });
          await tx.rentalRequestRccUsage.create({
            data: {
              rentalRequestId: rentalRequest.id,
              redCacheCreditId: rccUsage.rccId,
              usedAmount: rccUsage.selectedAmount,
            },
          });
        }
      }

      return rentalRequest;
    });

    // emit notification to owner
    try {
      const title = 'New Rental Request 😍';
      const body = `You have received a rental request for ${result.product.name}🥳`;
      const data = { url: '/dashboard/received-requests' };
      await createNotification(result.owner.id, title, body, data);
      //await createNotification("admin-id", title, body, data);
    } catch (error) {
      console.error("error in notification in create request", error);
    }

    // emit notification to admins
    await notifyAdmins(
      '📢 New Rental Request Submitted',
      `A new rental request has been created by user ${result.requester.name} for product ${result.product.name}.`,
      { url: `/dashboard/admin/manage-rental-requests` }
    );

    // send fallback email - just in case :)
    try {
      await resend.emails.send({
        from: "Brittoo <notifications@brittoo.xyz>",
        to: result.owner.email,
        subject: `Congratulations! You have received a request.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7f6;">
            <div style="text-align: center; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #2e7d32; font-size: 24px; margin-bottom: 20px;">Congratulations! You've Received a Request!</h2>
              <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                A new rental request is waiting for your review. Please take a moment to accept or respond to the request.
              </p>
              <a href="${process.env.CLIENT_BASE_URL}/dashboard/received-requests" style="display: inline-block; padding: 12px 24px; background-color: #4caf50; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 5px; margin: 20px 0;">
                View Received Requests
              </a>
              <p style="color: #374151; font-size: 14px; line-height: 1.5;">
                If you have any questions, feel free to contact our support team.
              </p>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error("error in email in create request", error);
    }
    res.status(201).json({
      success: true,
      message: "Rental request created successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getUserPlacedRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;

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
            pricePerHour: true,
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

export const getOwnerRentalRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;

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

export const acceptRentalRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;
    const {
      ownerSubmitMethod,
      ownerPhoneNumber,
      ownerSubmitTerminal,
      ownerSubmitAddress,
    } = req.body;

    // Validation
    if (
      !ownerSubmitMethod ||
      !ownerPhoneNumber ||
      ownerPhoneNumber.trim() === ""
    ) {
      throw new CustomError(
        "Submit method and phone number are required",
        400,
        "MISSING_FIELDS",
      );
    }
    if (ownerSubmitMethod === "HOME" && !ownerSubmitAddress) {
      throw new CustomError(
        "Submit address required for home deposit",
        400,
        "MISSING_FIELDS",
      );
    }
    if (ownerSubmitMethod === "BRITTOO_TERMINAL" && !ownerSubmitTerminal) {
      throw new CustomError(
        "Submit terminal not provided",
        400,
        "MISSING_FIELDS",
      );
    }

    const request = await prisma.rentalRequest.findFirst({
      where: {
        id: requestId,
        ownerId: userId,
        status: "REQUESTED_BY_RENTER",
        deletedAt: null,
      },
      include: {
        bccTransactions: {
          where: {
            status: "PENDING",
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!request) {
      throw new CustomError(
        "Rental request not found or already processed",
        404,
        "NOT_FOUND",
      );
    }
    if (request.paidWithBcc && request.bccTransactions.length <= 0) {
      throw new CustomError(
        "Used bcc but transaction unavailable",
        404,
        "NOT_FOUND",
      );
    }

    const updatedRequest = await prisma.$transaction(async (tx) => {
      const upReq = await tx.rentalRequest.update({
        where: { id: requestId },
        data: {
          status: "ACCEPTED_BY_OWNER",
          ownerSubmitMethod,
          ownerPhoneNumber: "+880" + ownerPhoneNumber,
          ownerSubmitAddress:
            ownerSubmitMethod === "HOME" ? ownerSubmitAddress : null,
          ownerSubmitTerminal:
            ownerSubmitMethod === "BRITTOO_TERMINAL"
              ? ownerSubmitTerminal
              : null,
        },
        include: {
          product: {
            select: {
              name: true,

              optimizedImages: true,
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
      });
      if (request.paidWithBcc) {
        const bccTransactionId = request.bccTransactions[0].id;
        await tx.bccTransaction.update({
          where: {
            id: bccTransactionId,
          },
          data: {
            status: "ACCEPTED",
            rentalRequestId: requestId,
          },
        });
      }

      return upReq;
    });

    //Emit notification to renter
    try {
      const title = 'Request Accepted';
      const body = `Your rental request for product ${updatedRequest.product.name} has been accepted 😍`;
      const data = { url: '/dashboard/placed-requests' };
      await createNotification(updatedRequest.requester.id, title, body, data);
    } catch (error) {
      console.error("error in accept rental notification", error);
    }

    try {
      await resend.emails.send({
        from: "Brittoo <notifications@brittoo.xyz>",
        to: updatedRequest.requester.email,
        subject: `Your Rental Request Has been accepted.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7f6;">
            <div style="text-align: center; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #2e7d32; font-size: 24px; margin-bottom: 20px;">Rental Request Accepted!</h2>
              <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                Your rental request has been successfully accepted. A member of the Brittoo team will contact you soon with further details.
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                Please have patience as we process your request.
              </p>
              <a href="${process.env.CLIENT_BASE_URL}/dashboard/placed-requests" style="display: inline-block; padding: 12px 24px; background-color: #4caf50; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 5px; margin: 20px 0;">
                View Your Requests
              </a>
              <p style="color: #374151; font-size: 14px; line-height: 1.5;">
                If you have any questions, feel free to reach out to our support team.
              </p>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error("error in accept rental email", error);
    }

    res.status(200).json({
      success: true,
      data: updatedRequest,
      message: "Rental request accepted successfully",
    });
  } catch (error) {
    console.error("Error accepting rental request:", error);
    next(error);
  }
};

export const rejectRentalRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;
    const { rejectReason } = req.body;

    // Enhanced validation
    if (!rejectReason || rejectReason.trim() === "") {
      throw new CustomError("Reject reason is required", 400, "MISSING_FIELDS");
    }

    if (rejectReason.trim().length > 500) {
      throw new CustomError("Reject reason must not exceed 500 characters", 400, "INVALID_INPUT");
    }

    const updatedRequest = await prisma.$transaction(async (tx) => {
      // Fetch the rental request with all needed data
      const request = await tx.rentalRequest.findFirst({
        where: {
          id: requestId,
          ownerId: userId,
          status: "REQUESTED_BY_RENTER",
          deletedAt: null,
        },
        include: {
          rccUsageDetails: {
            include: {
              redCacheCredit: true,
            },
          },
          bccWallet: true,
          product: {
            select: {
              name: true,
              optimizedImages: true,
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
      });

      if (!request) {
        throw new CustomError(
          "Rental request not found or already processed",
          404,
          "NOT_FOUND"
        );
      }

      // Validate amounts before processing
      if (request.usedBccAmount && request.usedBccAmount < 0) {
        throw new CustomError("Invalid BCC amount", 400, "INVALID_DATA");
      }

      // Handle BCC refund sequentially
      if (request.paidWithBcc && request.usedBccAmount && request.bccWalletId) {
        await tx.bccWallet.update({
          where: { id: request.bccWalletId },
          data: {
            availableBalance: { increment: request.usedBccAmount },
            lockedBalance: { decrement: request.usedBccAmount },
          },
        });

        await tx.bccTransaction.create({
          data: {
            userId: request.requesterId,
            walletId: request.bccWalletId,
            rentalRequestId: request.id,
            amount: request.usedBccAmount,
            status: "ACCEPTED",
            transactionType: "DEPOSIT_REFUND",
          },
        });
      }

      // Handle RCC refund sequentially
      if (request.paidWithRcc && request.rccUsageDetails.length > 0) {
        for (const usage of request.rccUsageDetails) {
          // Validate amount
          if (usage.usedAmount < 0) {
            throw new CustomError("Invalid RCC usage amount", 400, "INVALID_DATA");
          }

          await tx.redCacheCredit.update({
            where: { id: usage.redCacheCreditId, deletedAt: null },
            data: {
              inUse: { decrement: usage.usedAmount },
            },
          });
        }
      }

      // Update rental request status last
      const updatedRequest = await tx.rentalRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED_BY_OWNER",
          rejectReason: rejectReason.trim(),
        },
        include: {
          product: {
            select: {
              name: true,
              optimizedImages: true,
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
      });
      return updatedRequest;
    });

    try {
      const title = 'Request Rejected 😓';
      const body = `Your rental request for product ${updatedRequest.product.name} has been rejected 🤧`;
      const data = { url: '/dashboard/placed-requests' };
      await createNotification(updatedRequest.requester.id, title, body, data);
    } catch (notificationError) {
      console.error("Failed to create notification:", notificationError);
    }
    // try {
    //   await resend.emails.send({
    //     from: "Brittoo <notifications@brittoo.xyz>",
    //     to: updatedRequest.requester.email,
    //     subject: `Your Rental Request Has Been Rejected`,
    //     html: `
    //       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7f6;">
    //         <div style="text-align: center; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
    //           <h2 style="color: #d32f2f; font-size: 24px; margin-bottom: 20px;">Rental Request Rejected</h2>
    //           <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
    //             We're sorry, but your rental request for <strong>${updatedRequest.product.name}</strong> could not be accepted.
    //           </p>
    //           <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">
    //             <strong>Reason:</strong> ${rejectReason.trim()}
    //           </p>
    //           <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
    //             You can submit a new request or explore other available options.
    //           </p>
    //           <a href="${process.env.CLIENT_BASE_URL}/dashboard/placed-requests" style="display: inline-block; padding: 12px 24px; background-color: #4caf50; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 5px; margin: 20px 0;">
    //             View Your Requests
    //           </a>
    //           <p style="color: #374151; font-size: 14px; line-height: 1.5;">
    //             If you have any questions, feel free to reach out to our support team.
    //           </p>
    //         </div>
    //       </div>
    //     `,
    //   });
    // } catch (emailError) {
    //   console.error("Failed to send rejection email:", emailError);
    // }

    res.status(200).json({
      success: true,
      data: updatedRequest,
      message: "Rental request rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting rental request:", error);
    next(error);
  }
};


export const cancelRentalRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;
    const { cancelReason } = req.body;

    // Enhanced validation
    if (!cancelReason || cancelReason.trim() === "") {
      throw new CustomError("Cancel reason is required", 400, "MISSING_FIELDS");
    }

    if (cancelReason.trim().length > 500) {
      throw new CustomError("Cancel reason must not exceed 500 characters", 400, "INVALID_INPUT");
    }

    const updatedRequest = await prisma.$transaction(async (tx) => {
      // Fetch the rental request with all needed data
      const request = await tx.rentalRequest.findFirst({
        where: {
          id: requestId,
          requesterId: userId,
          status: {
            in: ["REQUESTED_BY_RENTER", "ACCEPTED_BY_OWNER"],
          },
          deletedAt: null,
        },
        include: {
          rccUsageDetails: {
            include: {
              redCacheCredit: true,
            },
          },
          bccWallet: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          product: {
            select: {
              name: true,
              optimizedImages: true,
            },
          },
          requester: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      if (!request) {
        throw new CustomError(
          "Rental request not found or already processed",
          404,
          "NOT_FOUND"
        );
      }

      // Validate amounts before processing
      if (request.usedBccAmount && request.usedBccAmount < 0) {
        throw new CustomError("Invalid BCC amount", 400, "INVALID_DATA");
      }

      // Handle BCC refund sequentially
      if (request.paidWithBcc && request.usedBccAmount && request.bccWalletId) {
        await tx.bccWallet.update({
          where: { id: request.bccWalletId },
          data: {
            availableBalance: { increment: request.usedBccAmount },
            lockedBalance: { decrement: request.usedBccAmount },
          },
        });

        await tx.bccTransaction.create({
          data: {
            userId: request.requesterId,
            walletId: request.bccWalletId,
            rentalRequestId: request.id,
            amount: request.usedBccAmount,
            status: "ACCEPTED",
            transactionType: "DEPOSIT_REFUND",
          },
        });
      }

      // Handle RCC refund sequentially
      if (request.paidWithRcc && request.rccUsageDetails.length > 0) {
        for (const usage of request.rccUsageDetails) {
          // Validate amount
          if (usage.usedAmount < 0) {
            throw new CustomError("Invalid RCC usage amount", 400, "INVALID_DATA");
          }

          await tx.redCacheCredit.update({
            where: { id: usage.redCacheCreditId, deletedAt: null },
            data: {
              inUse: { decrement: usage.usedAmount },
            },
          });
        }
      }

      const updatedRequest = await tx.rentalRequest.update({
        where: { id: requestId },
        data: {
          status: "CANCELLED_BY_RENTER",
          cancelReason: cancelReason.trim(),
        },
        include: {
          product: {
            select: {
              name: true,
              optimizedImages: true,
            },
          },
          requester: {
            select: {
              name: true,
              email: true,
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
      });

      return updatedRequest;
    });

    try {
      const title = 'Rental Request Cancelled 😓';
      const body = `The rental request for product ${updatedRequest.product.name} has been cancelled by the renter`;
      const data = { url: '/dashboard/received-requests' };
      await createNotification(updatedRequest.owner.id, title, body, data);
    } catch (notificationError) {
      console.error("Failed to create notification:", notificationError);
    }
    // try {
    //   await resend.emails.send({
    //     from: "Brittoo <notifications@brittoo.xyz>",
    //     to: updatedRequest.owner.email,
    //     subject: `Rental Request Cancelled`,
    //     html: `
    //       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7f6;">
    //         <div style="text-align: center; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
    //           <h2 style="color: #d32f2f; font-size: 24px; margin-bottom: 20px;">Rental Request Cancelled</h2>
    //           <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
    //             The rental request for your product <strong>${updatedRequest.product.name}</strong> has been cancelled by the renter.
    //           </p>
    //           <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">
    //             <strong>Reason for cancellation:</strong> ${cancelReason.trim()}
    //           </p>
    //           <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
    //             No further action is required at this time. You can view other pending requests or manage your products in your dashboard.
    //           </p>
    //           <a href="${process.env.CLIENT_BASE_URL}/dashboard/received-requests" style="display: inline-block; padding: 12px 24px; background-color: #4caf50; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 5px; margin: 20px 0;">
    //             View Received Requests
    //           </a>
    //           <p style="color: #374151; font-size: 14px; line-height: 1.5;">
    //             If you have any questions, feel free to reach out to our support team.
    //           </p>
    //         </div>
    //       </div>
    //     `,
    //   });
    // } catch (emailError) {
    //   console.error("Failed to send cancellation email:", emailError);
    // }

    res.status(200).json({
      success: true,
      data: updatedRequest,
      message: "Rental request cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling rental request:", error);
    next(error);
  }
};
