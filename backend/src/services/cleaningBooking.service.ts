import mongoose from "mongoose";
import CleaningBooking from "../models/CleaningBooking";
import CleaningSlot from "../models/CleaningSlot";
import CleaningService from "../models/CleaningService";
import { AppError } from "../utils/AppError";
import {
  CreateCleaningBookingInput,
  UpdateCleaningBookingStatusInput,
} from "../validators/cleaningBooking.validator";

export const createBooking = async (
  userId: string,
  data: CreateCleaningBookingInput,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const service = await CleaningService.findById(data.serviceId).session(
      session,
    );
    if (!service || !service.isActive)
      throw new AppError("Cleaning service not available", 404);

    const slot = await CleaningSlot.findById(data.slotId).session(session);
    if (!slot) throw new AppError("Cleaning slot not found", 404);
    if (slot.serviceId.toString() !== data.serviceId)
      throw new AppError("Slot does not belong to this cleaning service", 400);
    if (!slot.isAvailable)
      throw new AppError("This slot is not available", 409);
    if (slot.currentBookings >= slot.maxBookings)
      throw new AppError("Slot is fully booked", 409);

    const existingBooking = await CleaningBooking.findOne({
      userId,
      slotId: data.slotId,
      status: { $ne: "CANCELLED" },
    }).session(session);
    if (existingBooking)
      throw new AppError("You already have a booking for this slot", 409);

    const [booking] = await CleaningBooking.create(
      [
        {
          userId,
          serviceId: data.serviceId,
          slotId: data.slotId,
          date: slot.date,
          timeSlot: slot.timeSlot,
          vehicleModel: data.vehicleModel,
          vehiclePlate: data.vehiclePlate,
          notes: data.notes,
          status: "PENDING",
        },
      ],
      { session },
    );

    slot.currentBookings += 1;
    if (slot.currentBookings >= slot.maxBookings) {
      slot.isAvailable = false;
    }
    await slot.save({ session });

    await session.commitTransaction();
    return booking;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const getMyBookings = async (userId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    CleaningBooking.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("serviceId", "name duration price")
      .populate("slotId", "date timeSlot"),
    CleaningBooking.countDocuments({ userId }),
  ]);
  return { bookings, total, page, limit };
};

export const getAllBookings = async (
  page = 1,
  limit = 10,
  status?: string,
  date?: string,
  serviceId?: string,
) => {
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (date) filter.date = date;
  if (serviceId) filter.serviceId = serviceId;

  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    CleaningBooking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email")
      .populate("serviceId", "name duration price")
      .populate("slotId", "date timeSlot"),
    CleaningBooking.countDocuments(filter),
  ]);
  return { bookings, total, page, limit };
};

export const updateBookingStatus = async (
  id: string,
  data: UpdateCleaningBookingStatusInput,
) => {
  const booking = await CleaningBooking.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("userId", "name email");
  if (!booking) throw new AppError("Cleaning booking not found", 404);

  if (data.status === "CANCELLED") {
    const slot = await CleaningSlot.findById(booking.slotId);
    if (slot) {
      slot.currentBookings = Math.max(0, slot.currentBookings - 1);
      slot.isAvailable = true;
      await slot.save();
    }
  }
  return booking;
};

export const getBookingById = async (id: string, userId?: string) => {
  const filter: Record<string, unknown> = { _id: id };
  if (userId) filter.userId = userId;
  const booking = await CleaningBooking.findOne(filter)
    .populate("userId", "name email")
    .populate("serviceId", "name duration price");
  if (!booking) throw new AppError("Cleaning booking not found", 404);
  return booking;
};
