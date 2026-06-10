import { Response, NextFunction } from "express";
import * as cleaningBookingService from "../services/cleaningBooking.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { sendSuccess } from "../utils/apiResponse";

export const createBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const booking = await cleaningBookingService.createBooking(
      req.user!.userId,
      req.body,
    );
    sendSuccess(res, "Cleaning booking created", booking, 201);
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
    const result = await cleaningBookingService.getMyBookings(
      req.user!.userId,
      page,
      limit,
    );
    sendSuccess(res, "My cleaning bookings fetched", result.bookings, 200, {
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
    const fromDate = req.query.fromDate as string | undefined;
    const toDate = req.query.toDate as string | undefined;
    const serviceId = req.query.serviceId as string | undefined;
    const result = await cleaningBookingService.getAllBookings(
      page,
      limit,
      status,
      date,
      fromDate,
      toDate,
      serviceId,
    );
    sendSuccess(res, "All cleaning bookings fetched", result.bookings, 200, {
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
    const booking = await cleaningBookingService.updateBookingStatus(
      req.params.id,
      req.body,
    );
    sendSuccess(res, "Cleaning booking status updated", booking);
  } catch (err) {
    next(err);
  }
};

export const updateBookingBill = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const booking = await cleaningBookingService.updateBookingBill(
      req.params.id,
      req.body,
    );
    sendSuccess(res, "Cleaning booking bill updated", booking);
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
    const booking = await cleaningBookingService.getBookingById(
      req.params.id,
      userId,
    );
    sendSuccess(res, "Cleaning booking fetched", booking);
  } catch (err) {
    next(err);
  }
};
