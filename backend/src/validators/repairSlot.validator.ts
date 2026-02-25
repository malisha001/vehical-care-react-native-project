import { z } from "zod";

export const createRepairSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  timeSlot: z.string().min(1, "Time slot is required"), // e.g., "09:00-10:00"
  isAvailable: z.boolean().optional().default(true),
  maxBookings: z.number().int().min(1).optional().default(1),
});

export const createBulkSlotsSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlots: z.array(z.string()).min(1),
  maxBookings: z.number().int().min(1).optional().default(1),
});

export type CreateRepairSlotInput = z.infer<typeof createRepairSlotSchema>;
