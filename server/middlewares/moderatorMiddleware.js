import { CustomError } from "../lib/customError.js"

export const moderatorMiddleware = (req, res, next) => {
  try {
    if(req.user?.role !== "MODERATOR") {
      throw new CustomError("Access Denied! Moderator Route", 403);
    }
    next();
  } catch (error) {
    next(error);
  }
}