import { Response, NextFunction } from "express";
import { getDashboardMetrics } from "../services/dashboard.service";
import { sendSuccess } from "../utils/apiResponse";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getMetrics = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const metrics = await getDashboardMetrics();
    sendSuccess(res, "Dashboard metrics fetched", metrics);
  } catch (err) {
    next(err);
  }
};
