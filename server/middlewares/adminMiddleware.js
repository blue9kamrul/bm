import { CustomError } from "../lib/customError.js";
import prisma from "../config/prisma.js";

export const adminMiddleware = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const loggedInUser = await prisma.user.findUnique({
      where: {
        id: userId,
        deletedAt: null,
      }
    })
    if (loggedInUser.role !== "ADMIN") {
      throw new CustomError("Access denied, Admin only", 403, "ADMIN_VERIFICATION_ERROR");
    }
    req.user = loggedInUser;
    next();
  } catch (error) {
    next(error);
  }
}
