import { Request, Response, NextFunction } from "express";
import * as cleaningSlotService from "../services/cleaningSlot.service";
import { sendSuccess } from "../utils/apiResponse";

export const getAvailableSlots = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const serviceId = req.query.serviceId as string | undefined;
    const date = req.query.date as string | undefined;
    const slots = await cleaningSlotService.getAvailableSlots(serviceId, date);
    sendSuccess(res, "Available cleaning slots fetched", slots);
  } catch (err) {
    next(err);
  }
};

export const getAllSlots = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const serviceId = req.query.serviceId as string | undefined;
    const date = req.query.date as string | undefined;
    const slots = await cleaningSlotService.getAllSlots(serviceId, date);
    sendSuccess(res, "Cleaning slots fetched", slots);
  } catch (err) {
    next(err);
  }
};

export const createSlot = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const slot = await cleaningSlotService.createSlot(req.body);
    sendSuccess(res, "Cleaning slot created", slot, 201);
  } catch (err) {
    next(err);
  }
};

export const createBulkSlots = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { serviceId, startDate, endDate, timeSlots, maxBookings } = req.body;
    const slots = await cleaningSlotService.createBulkSlots(
      serviceId,
      startDate,
      endDate,
      timeSlots,
      maxBookings,
    );
    sendSuccess(res, "Bulk cleaning slots created", slots, 201);
  } catch (err) {
    next(err);
  }
};

export const updateSlot = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const slot = await cleaningSlotService.updateSlot(req.params.id, req.body);
    sendSuccess(res, "Cleaning slot updated", slot);
  } catch (err) {
    next(err);
  }
};

export const deleteSlot = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await cleaningSlotService.deleteSlot(req.params.id);
    sendSuccess(res, "Cleaning slot deleted");
  } catch (err) {
    next(err);
  }
};
