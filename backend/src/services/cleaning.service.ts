import CleaningService from "../models/CleaningService";
import { AppError } from "../utils/AppError";
import {
  CreateCleaningServiceInput,
  UpdateCleaningServiceInput,
} from "../validators/cleaning.validator";

export const getAllCleaningServices = async (isActive?: boolean) => {
  const filter: Record<string, unknown> = {};
  if (typeof isActive === "boolean") filter.isActive = isActive;
  return CleaningService.find(filter).sort({ createdAt: -1 });
};

export const getCleaningServiceById = async (id: string) => {
  const service = await CleaningService.findById(id);
  if (!service) throw new AppError("Cleaning service not found", 404);
  return service;
};

export const createCleaningService = async (
  data: CreateCleaningServiceInput,
) => {
  return CleaningService.create(data);
};

export const updateCleaningService = async (
  id: string,
  data: UpdateCleaningServiceInput,
) => {
  const service = await CleaningService.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!service) throw new AppError("Cleaning service not found", 404);
  return service;
};

export const deleteCleaningService = async (id: string) => {
  const service = await CleaningService.findByIdAndDelete(id);
  if (!service) throw new AppError("Cleaning service not found", 404);
  return service;
};
