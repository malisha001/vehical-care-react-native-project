import { Request, Response, NextFunction } from "express";
import * as repairSlotService from "../services/repairSlot.service";
import { sendSuccess } from "../utils/apiResponse";

export const getAvailableSlots = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const date = req.query.date as string | undefined;
    const slots = await repairSlotService.getAvailableSlots(date);
    sendSuccess(res, "Available slots fetched", slots);
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
    const date = req.query.date as string | undefined;
    const slots = await repairSlotService.getAllSlots(date);
    sendSuccess(res, "Slots fetched", slots);
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
    const slot = await repairSlotService.createSlot(req.body);
    sendSuccess(res, "Slot created", slot, 201);
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
    const { startDate, endDate, timeSlots, maxBookings } = req.body;
    const slots = await repairSlotService.createBulkSlots(
      startDate,
      endDate,
      timeSlots,
      maxBookings,
    );
    sendSuccess(res, "Bulk slots created", slots, 201);
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
    const slot = await repairSlotService.updateSlot(req.params.id, req.body);
    sendSuccess(res, "Slot updated", slot);
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
    await repairSlotService.deleteSlot(req.params.id);
    sendSuccess(res, "Slot deleted");
  } catch (err) {
    next(err);
  }
};
