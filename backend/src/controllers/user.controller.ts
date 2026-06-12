import { Response, NextFunction } from "express";
import * as userService from "../services/user.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { sendSuccess } from "../utils/apiResponse";

export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string | undefined;
    const role = req.query.role as string | undefined;
    const result = await userService.getAllUsers(page, limit, search, role);
    sendSuccess(res, "Users fetched", result.users, 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  } catch (err) {
    next(err);
  }
};

export const createAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const admin = await userService.createAdmin(req.body);
    sendSuccess(res, "Admin user created", admin, 201);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await userService.getUserById(req.params.id);
    sendSuccess(res, "User details fetched", result);
  } catch (err) {
    next(err);
  }
};
