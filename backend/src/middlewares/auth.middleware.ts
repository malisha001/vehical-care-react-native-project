import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JwtPayload } from "../utils/jwt";
import { sendError } from "../utils/apiResponse";
import User from "../models/User";

export interface AuthRequest extends Request {
  user?: JwtPayload & { _id: string };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, "Access token required", 401);
      return;
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);

    // Verify user still exists and is active
    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      sendError(res, "User not found or deactivated", 401);
      return;
    }

    req.user = { ...payload, _id: payload.userId };
    next();
  } catch {
    sendError(res, "Invalid or expired access token", 401);
  }
};
