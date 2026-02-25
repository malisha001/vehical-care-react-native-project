import RepairSlot from "../models/RepairSlot";
import { AppError } from "../utils/AppError";
import { CreateRepairSlotInput } from "../validators/repairSlot.validator";

export const createSlot = async (data: CreateRepairSlotInput) => {
  const exists = await RepairSlot.findOne({
    date: data.date,
    timeSlot: data.timeSlot,
  });
  if (exists)
    throw new AppError("Slot for this date and time already exists", 409);
  return RepairSlot.create(data);
};

export const createBulkSlots = async (
  startDate: string,
  endDate: string,
  timeSlots: string[],
  maxBookings = 1,
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const slots = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    for (const timeSlot of timeSlots) {
      slots.push({ date: dateStr, timeSlot, maxBookings, isAvailable: true });
    }
  }

  // Use insertMany with ordered:false to skip duplicates
  const result = await RepairSlot.insertMany(slots, { ordered: false }).catch(
    (err) => {
      if (err.code === 11000) return err.insertedDocs || [];
      throw err;
    },
  );
  return result;
};

export const getAvailableSlots = async (date?: string) => {
  const filter: Record<string, unknown> = { isAvailable: true };
  if (date) filter.date = date;
  // Only return future slots
  const today = new Date().toISOString().split("T")[0];
  filter.date = date || { $gte: today };
  return RepairSlot.find(filter).sort({ date: 1, timeSlot: 1 });
};

export const getAllSlots = async (date?: string) => {
  const filter: Record<string, unknown> = {};
  if (date) filter.date = date;
  return RepairSlot.find(filter).sort({ date: 1, timeSlot: 1 });
};

export const updateSlot = async (
  id: string,
  data: Partial<CreateRepairSlotInput & { isAvailable: boolean }>,
) => {
  const slot = await RepairSlot.findByIdAndUpdate(id, data, { new: true });
  if (!slot) throw new AppError("Slot not found", 404);
  return slot;
};

export const deleteSlot = async (id: string) => {
  const slot = await RepairSlot.findByIdAndDelete(id);
  if (!slot) throw new AppError("Slot not found", 404);
  return slot;
};
