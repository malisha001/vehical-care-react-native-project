import { Response, NextFunction } from "express";
import * as repairBookingService from "../services/repairBooking.service";
import { sendSuccess } from "../utils/apiResponse";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const booking = await repairBookingService.createBooking(
      req.user!.userId,
      req.body,
    );
    sendSuccess(res, "Repair booking created", booking, 201);
  } catch (err) {
    next(err);
  }
};

export const getMyBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await repairBookingService.getMyBookings(
      req.user!.userId,
      page,
      limit,
    );
    sendSuccess(res, "My bookings fetched", result.bookings, 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string | undefined;
    const date = req.query.date as string | undefined;
    const result = await repairBookingService.getAllBookings(
      page,
      limit,
      status,
      date,
    );
    sendSuccess(res, "All bookings fetched", result.bookings, 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  } catch (err) {
    next(err);
  }
};

export const updateBookingStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const booking = await repairBookingService.updateBookingStatus(
      req.params.id,
      req.body,
    );
    sendSuccess(res, "Booking status updated", booking);
  } catch (err) {
    next(err);
  }
};

export const respondToProposal = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const booking = await repairBookingService.respondToProposal(
      req.params.id,
      req.user!.userId,
      req.body,
    );
    sendSuccess(res, "Repair request updated", booking);
  } catch (err) {
    next(err);
  }
};

export const getBookingById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.role === "ADMIN" ? undefined : req.user!.userId;
    const booking = await repairBookingService.getBookingById(
      req.params.id,
      userId,
    );
    sendSuccess(res, "Booking fetched", booking);
  } catch (err) {
    next(err);
  }
};
