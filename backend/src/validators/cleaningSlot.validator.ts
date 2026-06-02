import { z } from "zod";

export const createCleaningSlotSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  timeSlot: z.string().min(1, "Time slot is required"),
  isAvailable: z.boolean().optional().default(true),
  maxBookings: z.number().int().min(1).optional().default(1),
});

export const createBulkCleaningSlotsSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlots: z.array(z.string()).min(1),
  maxBookings: z.number().int().min(1).optional().default(1),
});

export type CreateCleaningSlotInput = z.infer<
  typeof createCleaningSlotSchema
>;
