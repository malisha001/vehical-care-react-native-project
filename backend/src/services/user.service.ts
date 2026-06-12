import mongoose from "mongoose";
import User from "../models/User";
import CleaningBooking from "../models/CleaningBooking";
import RepairBooking from "../models/RepairBooking";
import CarrierRequest from "../models/CarrierRequest";
import { AppError } from "../utils/AppError";
import { CreateAdminInput } from "../validators/user.validator";

const publicUserFields = "name email role isActive createdAt updatedAt";

export const createAdmin = async (data: CreateAdminInput) => {
  const existing = await User.findOne({
    email: data.email.toLowerCase().trim(),
  });
  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    role: "ADMIN",
    isActive: true,
  });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const getAllUsers = async (
  page = 1,
  limit = 20,
  search?: string,
  role?: string,
) => {
  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter)
      .select(publicUserFields)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return { users, total, page, limit };
};

export const getUserById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("User not found", 404);
  }

  const user = await User.findById(id).select(publicUserFields);
  if (!user) throw new AppError("User not found", 404);

  const [
    cleaningBookingsCount,
    repairBookingsCount,
    carrierRequestsCount,
    recentCleaningBookings,
    recentRepairBookings,
    recentCarrierRequests,
  ] = await Promise.all([
    CleaningBooking.countDocuments({ userId: id }),
    RepairBooking.countDocuments({ userId: id }),
    CarrierRequest.countDocuments({ userId: id }),
    CleaningBooking.find({ userId: id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("serviceId", "name price duration"),
    RepairBooking.find({ userId: id }).sort({ createdAt: -1 }).limit(5),
    CarrierRequest.find({ userId: id }).sort({ createdAt: -1 }).limit(5),
  ]);

  return {
    user,
    stats: {
      cleaningBookings: cleaningBookingsCount,
      repairBookings: repairBookingsCount,
      carrierRequests: carrierRequestsCount,
    },
    recentCleaningBookings,
    recentRepairBookings,
    recentCarrierRequests,
  };
};
