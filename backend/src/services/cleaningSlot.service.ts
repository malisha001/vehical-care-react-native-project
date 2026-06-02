import CleaningSlot from "../models/CleaningSlot";
import CleaningService from "../models/CleaningService";
import { AppError } from "../utils/AppError";
import { CreateCleaningSlotInput } from "../validators/cleaningSlot.validator";

export const createSlot = async (data: CreateCleaningSlotInput) => {
  const service = await CleaningService.findById(data.serviceId);
  if (!service) throw new AppError("Cleaning service not found", 404);

  const exists = await CleaningSlot.findOne({
    serviceId: data.serviceId,
    date: data.date,
    timeSlot: data.timeSlot,
  });
  if (exists)
    throw new AppError("Slot for this service, date, and time already exists", 409);

  return CleaningSlot.create(data);
};

export const createBulkSlots = async (
  serviceId: string,
  startDate: string,
  endDate: string,
  timeSlots: string[],
  maxBookings = 1,
) => {
  const service = await CleaningService.findById(serviceId);
  if (!service) throw new AppError("Cleaning service not found", 404);

  const start = new Date(startDate);
  const end = new Date(endDate);
  const slots = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    for (const timeSlot of timeSlots) {
      slots.push({
        serviceId,
        date: dateStr,
        timeSlot,
        maxBookings,
        isAvailable: true,
      });
    }
  }

  const result = await CleaningSlot.insertMany(slots, { ordered: false }).catch(
    (err) => {
      if (err.code === 11000) return err.insertedDocs || [];
      throw err;
    },
  );
  return result;
};

export const getAvailableSlots = async (serviceId?: string, date?: string) => {
  const filter: Record<string, unknown> = { isAvailable: true };
  if (serviceId) filter.serviceId = serviceId;
  const today = new Date().toISOString().split("T")[0];
  filter.date = date || { $gte: today };
  return CleaningSlot.find(filter)
    .sort({ date: 1, timeSlot: 1 })
    .populate("serviceId", "name duration price");
};

export const getAllSlots = async (serviceId?: string, date?: string) => {
  const filter: Record<string, unknown> = {};
  if (serviceId) filter.serviceId = serviceId;
  if (date) filter.date = date;
  return CleaningSlot.find(filter)
    .sort({ date: 1, timeSlot: 1 })
    .populate("serviceId", "name duration price");
};

export const updateSlot = async (
  id: string,
  data: Partial<CreateCleaningSlotInput & { isAvailable: boolean }>,
) => {
  const slot = await CleaningSlot.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!slot) throw new AppError("Cleaning slot not found", 404);
  return slot;
};

export const deleteSlot = async (id: string) => {
  const slot = await CleaningSlot.findByIdAndDelete(id);
  if (!slot) throw new AppError("Cleaning slot not found", 404);
  return slot;
};
