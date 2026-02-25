import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { sendError } from "../utils/apiResponse";
import { UserRole } from "../models/User";

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }
    if (!roles.includes(req.user.role as UserRole)) {
      sendError(res, "Insufficient permissions", 403);
      return;
    }
    next();
  };
};

export const requireAdmin = requireRole("ADMIN");
export const requireUser = requireRole("USER", "ADMIN");
