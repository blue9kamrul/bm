import { CustomError } from "../../server/lib/customError.js";
import { verifyToken } from "../grpc/authClient.js";

const capitalizeWords = (str) =>
  str.replace(/\b\w/g, (c) => c.toUpperCase());

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  if (!token) return next(new CustomError("Authorization token missing, Please Log In again", 401, "NO_TOKEN_PROVIDED"));
  try {
    const result = await verifyToken(token);
    if (!result.valid) {
      return next(new CustomError(capitalizeWords(result.error + ", Please log in again"), 403, "USER_VERIFICATION_ERROR"));
    }
    req.user = { name: result.name, email: result.email, role: result.role, id: result.id };
    next();
  } catch (error) {
    console.error("gRPC error:", error);
    next(new CustomError("Invalid token, Please Log In again.", 401, "INVALID_TOKEN"));
  }
}