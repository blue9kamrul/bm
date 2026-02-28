import fs from "fs";
import path from "path";
import prisma from "../config/prisma.js";
import { uploadsDirPath } from "../middlewares/uploadMiddleware.js";
import jwt from 'jsonwebtoken';

export const verifyUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }
    if (!req.files || !req.files.idCard || !req.files.selfie) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Both ID card and selfie images are required",
        });
    }
    const idCardFile = req.files.idCard[0];
    const selfieFile = req.files.selfie[0];

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      fs.unlinkSync(idCardFile.path);
      fs.unlinkSync(selfieFile.path);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.isVerified === "VERIFIED") {
      fs.unlinkSync(idCardFile.path);
      fs.unlinkSync(selfieFile.path);
      return res
        .status(400)
        .json({ success: false, message: "User is already verified" });
    }
    if (user.isVerified === "PENDING") {
      fs.unlinkSync(idCardFile.path);
      fs.unlinkSync(selfieFile.path);
      return res
        .status(400)
        .json({
          success: false,
          message: "You have already requested for verification",
        });
    }
    if (user.idCardFront && user.idCardFront !== "absent") {
      const oldIdCardPath = path.join(uploadsDirPath, user.idCardFront);
      if (fs.existsSync(oldIdCardPath)) fs.unlinkSync(oldIdCardPath);
    }
    if (user.selfie && user.selfie !== "absent") {
      const oldSelfiePath = path.join(uploadsDirPath, user.selfie);
      if (fs.existsSync(oldSelfiePath)) fs.unlinkSync(oldSelfiePath);
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        idCardFront: `/uploads/${idCardFile.filename}`,
        selfie: `/uploads/${selfieFile.filename}`,
        isVerified: "PENDING",
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isSuspended: user.isSuspended,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2d" },
    );
    const { password: _, otp: __, otpExpiry: ___, ...safeUser } = updatedUser;

    res.status(200).json({
      success: true,
      user: safeUser,
      token,
      message:
        "Verification documents uploaded successfully. Your submission is now under review.",
    });
  } catch (error) {
    console.error("Verification error:", error);
    if (req.files) {
      ["idCard", "selfie"].forEach((field) => {
        if (req.files[field]) {
          req.files[field].forEach((file) => {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          });
        }
      });
    }
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({
          success: false,
          message: "File size too large. Maximum size is 5MB per file.",
        });
    }
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error. Please try again later.",
      });
  }
};