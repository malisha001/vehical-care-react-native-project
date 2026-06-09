import RepairBooking from "../models/RepairBooking";
import { AppError } from "../utils/AppError";
import {
  CreateRepairBookingInput,
  UpdateBookingBillInput,
  UpdateBookingStatusInput,
  UserRepairDecisionInput,
} from "../validators/repairBooking.validator";

const calculateTotal = (items: UpdateBookingBillInput["items"]) =>
  items.reduce((sum, item) => sum + item.amount, 0);

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

export const updateBookingBill = async (
  id: string,
  data: UpdateBookingBillInput,
) => {
  const booking = await RepairBooking.findById(id).populate("userId", "name email");
  if (!booking) throw new AppError("Booking not found", 404);

  if (booking.bill?.status === "FINALIZED") {
    throw new AppError("Finalized bills cannot be changed", 400);
  }

  const items = data.items.map((item) => ({
    description: item.description,
    amount: item.amount,
  }));

  booking.bill = {
    items,
    total: calculateTotal(items),
    status: data.finalize ? "FINALIZED" : "DRAFT",
    finalizedAt: data.finalize ? new Date() : undefined,
  };

  await booking.save();
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
