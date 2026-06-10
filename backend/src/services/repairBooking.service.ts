import RepairBooking from "../models/RepairBooking";
import { AppError } from "../utils/AppError";
import {
  CreateRepairBookingInput,
  UpdateBookingStatusInput,
  UpdateRepairBookingBillInput,
  UserRepairDecisionInput,
} from "../validators/repairBooking.validator";

export const createBooking = async (
  userId: string,
  data: CreateRepairBookingInput,
) => {
  return RepairBooking.create({
    userId,
    customerName: data.customerName,
    phone: data.phone,
    requestedDate: data.requestedDate,
    vehicleModel: data.vehicleModel,
    vehiclePlate: data.vehiclePlate,
    issueDescription: data.issueDescription,
    status: "REQUESTED",
  });
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
  if (date) {
    filter.$or = [{ requestedDate: date }, { scheduledDate: date }];
  }

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
  if (
    (data.status === "PROPOSED" || data.status === "ACCEPTED") &&
    !data.scheduledDate
  ) {
    throw new AppError("Scheduled date is required", 400);
  }

  const booking = await RepairBooking.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("userId", "name email");
  if (!booking) throw new AppError("Booking not found", 404);
  return booking;
};

export const respondToProposal = async (
  id: string,
  userId: string,
  data: UserRepairDecisionInput,
) => {
  const booking = await RepairBooking.findOne({ _id: id, userId });
  if (!booking) throw new AppError("Booking not found", 404);
  if (booking.status !== "PROPOSED") {
    throw new AppError("Only proposed repair dates can be accepted or cancelled", 400);
  }

  booking.status = data.decision === "ACCEPT" ? "ACCEPTED" : "CANCELLED";
  await booking.save();
  return booking;
};

export const updateBookingBill = async (
  id: string,
  data: UpdateRepairBookingBillInput,
) => {
  const booking = await RepairBooking.findById(id);
  if (!booking) throw new AppError("Booking not found", 404);
  if (booking.status === "CANCELLED") {
    throw new AppError("Cannot bill a cancelled repair booking", 400);
  }

  const baseServicePrice = data.baseServicePrice ?? booking.baseServicePrice ?? 0;
  const billItems = data.billItems ?? booking.billItems ?? [];
  const billTotal = billItems.reduce(
    (total, item) => total + item.price,
    baseServicePrice,
  );
  const finalizing = data.billStatus === "FINALIZED";

  booking.baseServicePrice = baseServicePrice;
  booking.billItems = billItems;
  booking.billTotal = billTotal;
  booking.billStatus = data.billStatus ?? booking.billStatus ?? "DRAFT";
  if (finalizing) {
    booking.billFinalizedAt = new Date();
  } else if (data.billStatus === "DRAFT") {
    booking.billFinalizedAt = undefined;
  }

  await booking.save();
  return booking.populate([
    { path: "userId", select: "name email" },
    { path: "slotId", select: "date timeSlot" },
  ]);
};

export const getBookingById = async (id: string, userId?: string) => {
  const filter: Record<string, unknown> = { _id: id };
  if (userId) filter.userId = userId;
  const booking = await RepairBooking.findOne(filter)
    .populate("userId", "name email")
    .populate("slotId", "date timeSlot");
  if (!booking) throw new AppError("Booking not found", 404);
  return booking;
};
