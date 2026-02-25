import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import logger from "../utils/logger";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error(`${req.method} ${req.url} - ${err.message}`);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
    });
    return;
  }

  // Mongoose duplicate key error
  if (
    (err as NodeJS.ErrnoException).name === "MongoServerError" &&
    (err as { code?: number }).code === 11000
  ) {
    res.status(409).json({
      success: false,
      message: "Duplicate entry. Record already exists.",
      data: null,
    });
    return;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
    return;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      data: null,
    });
    return;
  }

  // Default 500
  res.status(500).json({
    success: false,
    message: "Internal server error",
    data: null,
  });
};
