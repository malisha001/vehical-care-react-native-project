import { Response, NextFunction } from "express";
import { getDashboardMetrics } from "../services/dashboard.service";
import { sendSuccess } from "../utils/apiResponse";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getMetrics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const range = req.query.range === "today" ? "today" : "all";
    const metrics = await getDashboardMetrics(range);
    sendSuccess(res, "Dashboard metrics fetched", metrics);
  } catch (err) {
    next(err);
  }
};
