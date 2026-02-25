import User from "../models/User";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { AppError } from "../utils/AppError";
import { RegisterInput, LoginInput } from "../validators/auth.validator";

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

export const logoutUser = async (userId: string) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  return user;
};
