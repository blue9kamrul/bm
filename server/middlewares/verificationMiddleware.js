import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";

export const verificationMiddleware = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const loggedInUser = await prisma.user.findUnique({
      where: {
        id: userId,
        deletedAt: null,
      }
    })
    if (loggedInUser.isVerified !== "VERIFIED") {
      throw new CustomError("Access denied! Only verified users can perform this operation", 403, "VERIFICATION_ERROR");
    }
    if (loggedInUser.suspensionCount >= 3) {
      throw new CustomError("Access denied! You are suspended", 403, "VERIFICATION_ERROR");
    }
    next();
  } catch (error) {
    next(error);
  }
}