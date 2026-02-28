import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { isValidRuetEmail } from "../lib/emailValidator.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { safeAuthUserSelect } from "../lib/prismaSelects.js";
const resend = new Resend(`${process.env.RESEND_API_KEY}`);

export const register = async (req, res, next) => {
  const { name, email, password, latitude, longitude, ipAddress } = req.body;

  try {
    const isValidRuetMail = isValidRuetEmail(email);
    let user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (user) {
      throw new CustomError("User already exists!", 401);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    const roll = email.split("@")[0];

    user = await prisma.user.create({
      data: {
        name,
        email,
        isValidRuetMail,
        password: hashedPassword,
        roll,
        latitude,
        longitude,
        ipAddress,
        otpExpiry,
        otp,
        otpSentCount: 1,
        lastOtpSentDate: new Date(),
      },
    });

    await resend.emails.send({
      from: "Brittoo <verify@brittoo.xyz>",
      to: email,
      subject: "Your Brittoo OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Brittoo!</h2>
          <p>Your OTP verification code is:</p>
          <div style="font-size: 24px; font-weight: bold; color: #007bff; padding: 20px; background-color: #f8f9fa; border-radius: 5px; text-align: center; margin: 20px 0;">
            ${otp}
          </div>
          <p><strong>Important:</strong> This code expires in 5 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });
    const { password: _, otp: __, otpExpiry: ___, ...safeUser } = user;
    return res.status(201).json({
      success: true,
      message: "User created successfully. OTP sent to your email.",
      user: safeUser,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const resendOTP = async (req, res, next) => {
  const { email } = req.body;

  try {
    if (!email) {
      throw new CustomError("Email is required", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    if (user.emailVerified) {
      throw new CustomError("Email is already verified", 400);
    }

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let currentOtpCount = 0;

    if (
      user.lastOtpSentDate &&
      new Date(user.lastOtpSentDate) > twentyFourHoursAgo
    ) {
      currentOtpCount = user.otpSentCount;
    } else {
      // More than 24 hours ago
      currentOtpCount = 2;
    }

    // Check 24-hour limit (max 3 OTPs in 24 hours)
    if (currentOtpCount >= 30) {
      const timeUntilReset = user.lastOtpSentDate
        ? new Date(
          new Date(user.lastOtpSentDate).getTime() + 24 * 60 * 60 * 1000,
        )
        : new Date();

      const hoursLeft = Math.ceil((timeUntilReset - now) / (60 * 60 * 1000));

      throw new CustomError(
        `24-hour OTP limit reached. Please try again in ${hoursLeft} hour(s).`,
        429,
      );
    }

    const lastOtpTime = user.otpExpiry
      ? new Date(user.otpExpiry).getTime() - 5 * 60 * 1000
      : 0;
    const timeSinceLastOtp = Date.now() - lastOtpTime;
    const minWaitTime = 60 * 1000;

    if (timeSinceLastOtp < minWaitTime) {
      const waitTime = Math.ceil((minWaitTime - timeSinceLastOtp) / 1000);
      throw new CustomError(
        `Please wait ${waitTime} seconds before requesting a new OTP`,
        429,
      );
    }

    const newOtp = Math.floor(10000 + Math.random() * 90000).toString();
    const newOtpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        otp: newOtp,
        otpExpiry: newOtpExpiry,
        otpSentCount: currentOtpCount + 1,
        lastOtpSentDate: now,
      },
    });

    await resend.emails.send({
      from: "Brittoo <verify@brittoo.xyz>",
      to: email,
      subject: "Your Brittoo OTP Code - Resent",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>OTP Resent</h2>
          <p>Your new OTP verification code is:</p>
          <div style="font-size: 24px; font-weight: bold; color: #007bff; padding: 20px; background-color: #f8f9fa; border-radius: 5px; text-align: center; margin: 20px 0;">
            ${newOtp}
          </div>
          <p><strong>Important:</strong> This code expires in 5 minutes.</p>
          <p>Remaining OTP requests in 24 hours: ${3 - updatedUser.otpSentCount}</p>
          <p>If you didn't request this code, please secure your account immediately.</p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
      data: {
        email,
        otpSentCount: updatedUser.otpSentCount,
        remainingAttempts: 3 - updatedUser.otpSentCount,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;
  console.log(req.body);

  try {
    if (!email || !otp) {
      throw new CustomError("Email and OTP are required", 400);
    }
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    if (user.emailVerified) {
      throw new CustomError("Email is already verified", 400);
    }
    if (user.otp !== otp) {
      throw new CustomError("Invalid OTP", 401);
    }
    if (user.otpExpiry < new Date()) {
      throw new CustomError("OTP has expired", 401);
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        otp: null,
        otpExpiry: null,
        emailVerified: true,
        otpSentCount: 0,
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );

    const { password: _, otp: __, otpExpiry: ___, ...safeUser } = updatedUser;
    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new CustomError("Email and password are required", 400);
    }
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user) {
      throw new CustomError("User not found", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new CustomError("Invalid password", 401);
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );

    const { password: _, otp: __, otpExpiry: ___, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const loggedInUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: safeAuthUserSelect
    });
    if (!loggedInUser) {
      throw new CustomError(
        "User not currently Logged In.",
        403,
      );
    }
    return res.status(200).json({
      success: true,
      message: "Authentication Successfull",
      data: loggedInUser,
    });
  } catch (error) {
    console.error("error in getting current user controller", error);
    next(error);
  }
};

export const generatePasswordResetToken = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new CustomError("User doesn't exist with this mail!", 401);
    }
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentRequestsCount = await prisma.passwordResetToken.count({
      where: {
        userId: user.id,
        createdAt: { gte: twentyFourHoursAgo }
      }
    });
    if (recentRequestsCount > 3) {
      throw new CustomError("Too many reset requests. Please try again tomorrow.", 429);
    }
    // Delete any existing reset tokens for this user (to satisfy unique constraint)
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
      }
    });


    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    });

    const resetLink = `${process.env.CLIENT_BASE_URL}/reset-password?token=${token}`;
    await resend.emails.send({
      from: "Brittoo <notifications@brittoo.xyz>",
      to: email,
      subject: "Reset Your Brittoo Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your Brittoo account password.</p>
          <p>Click the link below to set a new password. This link is valid for 15 minutes:</p>
          <div style="margin: 20px 0; text-align: center;">
            <a href="${resetLink}"
              style="display: inline-block; padding: 12px 24px; font-size: 16px; color: white; background-color: #007bff; border-radius: 5px; text-decoration: none;">
              Reset Password
            </a>
          </div>
          <p>If you didn’t request a password reset, you can safely ignore this email.</p>
          <hr>
          <p style="font-size: 12px; color: #666;">If the button doesn’t work, copy and paste this URL into your browser:<br>
          <a href="${resetLink}">${resetLink}</a></p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Reset link sent successfully",
    })
  } catch (error) {
    console.error("error in reset pass controller", error);
    next(error);
  }
}

export const validateResetToken = async (req, res, next) => {
  const { token } = req.params;
  try {
    if (!token) {
      throw new CustomError("Token is required", 400);
    }
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: {
        user: {
          select: { email: true, isSuspended: true }
        }
      }
    });
    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
        valid: false
      });
    }
    if (resetToken.used) {
      return res.status(400).json({
        success: false,
        message: "This reset link has already been used",
        valid: false
      });
    }
    if (new Date() > resetToken.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "Reset link has expired",
        valid: false
      });
    }
    res.status(200).json({
      success: true,
      message: "Token is valid",
      valid: true,
      data: {
        email: resetToken.user.email,
        expiresAt: resetToken.expiresAt
      }
    });
  } catch (error) {
    console.error("Error validating reset token:", error);
    next(error);
  }
};


export const resetPasswordWithToken = async (req, res, next) => {
  const { token, newPassword } = req.body;

  try {
    if (!token || !newPassword) {
      throw new CustomError("Token and new password are required", 400);
    }
    // Find and validate token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });
    if (!resetToken) {
      throw new CustomError("Invalid or expired reset token", 400);
    }
    if (resetToken.used) {
      throw new CustomError("This reset link has already been used", 400);
    }
    if (new Date() > resetToken.expiresAt) {
      throw new CustomError("Reset link has expired. Please request a new one.", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword }
      });
      await tx.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true }
      });
      // Invalidate all other reset tokens for this user
      await tx.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          used: false,
          id: { not: resetToken.id }
        },
        data: { used: true }
      });
    });
    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Error in reset password with token:", error);
    next(error);
  }
};