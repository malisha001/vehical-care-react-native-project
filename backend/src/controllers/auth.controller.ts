import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { sendSuccess } from "../utils/apiResponse";
import { AuthRequest } from "../middlewares/auth.middleware";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await authService.registerUser(req.body);
    sendSuccess(res, "Registration successful", user, 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await authService.loginUser(req.body);
    sendSuccess(res, "Login successful", data);
  } catch (err) {
    next(err);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshTokens(refreshToken);
    sendSuccess(res, "Token refreshed", tokens);
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    await authService.logoutUser(req.user!.userId);
    sendSuccess(res, "Logged out successfully");
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await authService.getUserProfile(req.user!.userId);
    sendSuccess(res, "Profile fetched", user);
  } catch (err) {
    next(err);
  }
};
