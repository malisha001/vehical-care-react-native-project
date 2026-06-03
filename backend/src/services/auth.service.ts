import crypto from "crypto";
import User from "../models/User";
import env from "../config/env";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { AppError } from "../utils/AppError";
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../validators/auth.validator";

const RESET_OTP_EXPIRY_MINUTES = 15;

const hashResetOtp = (email: string, otp: string) =>
  crypto
    .createHash("sha256")
    .update(`${email.toLowerCase().trim()}:${otp}`)
    .digest("hex");

const sendPasswordResetOtp = async (params: {
  toEmail: string;
  toName: string;
  otp: string;
}) => {
  if (
    !env.EMAILJS_SERVICE_ID ||
    !env.EMAILJS_TEMPLATE_ID ||
    !env.EMAILJS_PUBLIC_KEY
  ) {
    throw new AppError("Email service is not configured", 500);
  }

  const body: Record<string, unknown> = {
    service_id: env.EMAILJS_SERVICE_ID,
    template_id: env.EMAILJS_TEMPLATE_ID,
    user_id: env.EMAILJS_PUBLIC_KEY,
    template_params: {
      to_email: params.toEmail,
      to_name: params.toName,
      otp_code: params.otp,
      expires_in: RESET_OTP_EXPIRY_MINUTES,
    },
  };

  if (env.EMAILJS_PRIVATE_KEY) {
    body.accessToken = env.EMAILJS_PRIVATE_KEY;
  }

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new AppError("Failed to send password reset email", 502);
  }
};

export const registerUser = async (data: RegisterInput) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new AppError("Email already registered", 409);

  const user = await User.create(data);
  return { _id: user._id, name: user.name, email: user.email, role: user.role };
};

export const loginUser = async (data: LoginInput) => {
  const user = await User.findOne({ email: data.email }).select(
    "+password +refreshToken",
  );
  if (!user || !user.isActive) throw new AppError("Invalid credentials", 401);

  const isMatch = await user.comparePassword(data.password);
  if (!isMatch) throw new AppError("Invalid credentials", 401);

  const payload = { userId: String(user._id), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const refreshTokens = async (token: string) => {
  const payload = verifyRefreshToken(token);
  const user = await User.findById(payload.userId).select("+refreshToken");
  if (!user || !user.isActive || user.refreshToken !== token) {
    throw new AppError("Invalid refresh token", 401);
  }

  const newPayload = { userId: String(user._id), role: user.role };
  const accessToken = signAccessToken(newPayload);
  const refreshToken = signRefreshToken(newPayload);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export const requestPasswordReset = async (data: ForgotPasswordInput) => {
  const user = await User.findOne({
    email: data.email.toLowerCase().trim(),
  }).select(
    "+resetPasswordOtp +resetPasswordExpires",
  );

  if (!user || !user.isActive) {
    return null;
  }

  const otp = crypto.randomInt(100000, 1000000).toString();
  user.resetPasswordOtp = hashResetOtp(user.email, otp);
  user.resetPasswordExpires = new Date(
    Date.now() + RESET_OTP_EXPIRY_MINUTES * 60 * 1000,
  );

  await user.save({ validateBeforeSave: false });
  await sendPasswordResetOtp({
    toEmail: user.email,
    toName: user.name,
    otp,
  });

  return {
    expiresInMinutes: RESET_OTP_EXPIRY_MINUTES,
  };
};

export const resetPassword = async (data: ResetPasswordInput) => {
  const email = data.email.toLowerCase().trim();
  const hashedOtp = hashResetOtp(email, data.otp);

  const user = await User.findOne({
    email,
    resetPasswordOtp: hashedOtp,
    resetPasswordExpires: { $gt: new Date() },
  }).select(
    "+password +refreshToken +resetPasswordOtp +resetPasswordExpires",
  );

  if (!user || !user.isActive) {
    throw new AppError("Invalid or expired OTP code", 400);
  }

  user.password = data.password;
  user.refreshToken = undefined;
  user.resetPasswordOtp = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
};

export const logoutUser = async (userId: string) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  return user;
};
