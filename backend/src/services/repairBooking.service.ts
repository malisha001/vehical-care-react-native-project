import mongoose from "mongoose";
import RepairBooking from "../models/RepairBooking";
import RepairSlot from "../models/RepairSlot";
import { AppError } from "../utils/AppError";
import {
  CreateRepairBookingInput,
  UpdateBookingStatusInput,
} from "../validators/repairBooking.validator";

export const createBooking = async (
  userId: string,
  data: CreateRepairBookingInput,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find and lock the slot
    const slot = await RepairSlot.findById(data.slotId).session(session);
    if (!slot) throw new AppError("Repair slot not found", 404);
    if (!slot.isAvailable)
      throw new AppError("This slot is not available", 409);
    if (slot.currentBookings >= slot.maxBookings)
      throw new AppError("Slot is fully booked", 409);

    // Check if user already booked this slot
    const existingBooking = await RepairBooking.findOne({
      userId,
      slotId: data.slotId,
      status: { $ne: "CANCELLED" },
    }).session(session);
    if (existingBooking)
      throw new AppError("You already have a booking for this slot", 409);

    // Create booking
    const [booking] = await RepairBooking.create(
      [
        {
          userId,
          slotId: data.slotId,
          date: slot.date,
          timeSlot: slot.timeSlot,
          vehicleModel: data.vehicleModel,
          vehiclePlate: data.vehiclePlate,
          issueDescription: data.issueDescription,
          status: "PENDING",
        },
      ],
      { session },
    );

    // Increment slot bookings
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
    RepairBooking.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("slotId", "date timeSlot"),
    RepairBooking.countDocuments({ userId }),
  ]);
  return { bookings, total, page, limit };
};

export const getAllBookings = async (
  page = 1,
  limit = 10,
  status?: string,
  date?: string,
) => {
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (date) filter.date = date;

  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    RepairBooking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email")
      .populate("slotId", "date timeSlot"),
    RepairBooking.countDocuments(filter),
  ]);
  return { bookings, total, page, limit };
};

export const updateBookingStatus = async (
  id: string,
  data: UpdateBookingStatusInput,
) => {
  const booking = await RepairBooking.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("userId", "name email");
  if (!booking) throw new AppError("Booking not found", 404);

  // If cancelled, free up the slot
  if (data.status === "CANCELLED") {
    const slot = await RepairSlot.findById(booking.slotId);
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
  const booking = await RepairBooking.findOne(filter).populate(
    "userId",
    "name email",
  );
  if (!booking) throw new AppError("Booking not found", 404);
  return booking;
};
