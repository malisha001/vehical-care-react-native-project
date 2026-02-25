import CarrierRequest from "../models/CarrierRequest";
import { AppError } from "../utils/AppError";
import {
  CreateCarrierRequestInput,
  UpdateCarrierStatusInput,
} from "../validators/carrierRequest.validator";

export const createCarrierRequest = async (
  userId: string,
  data: CreateCarrierRequestInput,
) => {
  return CarrierRequest.create({ ...data, userId });
};

export const getMyCarrierRequests = async (
  userId: string,
  page = 1,
  limit = 10,
) => {
  const skip = (page - 1) * limit;
  const [requests, total] = await Promise.all([
    CarrierRequest.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    CarrierRequest.countDocuments({ userId }),
  ]);
  return { requests, total, page, limit };
};

export const getAllCarrierRequests = async (
  page = 1,
  limit = 10,
  status?: string,
) => {
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [requests, total] = await Promise.all([
    CarrierRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email"),
    CarrierRequest.countDocuments(filter),
  ]);
  return { requests, total, page, limit };
};

export const updateCarrierStatus = async (
  id: string,
  data: UpdateCarrierStatusInput,
) => {
  const request = await CarrierRequest.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("userId", "name email");
  if (!request) throw new AppError("Carrier request not found", 404);
  return request;
};

export const getCarrierRequestById = async (id: string, userId?: string) => {
  const filter: Record<string, unknown> = { _id: id };
  if (userId) filter.userId = userId;
  const request = await CarrierRequest.findOne(filter);
  if (!request) throw new AppError("Carrier request not found", 404);
  return request;
};
