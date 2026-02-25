import { z } from "zod";

export const createRepairBookingSchema = z.object({
  slotId: z.string().min(1, "Slot ID is required"),
  vehicleModel: z.string().max(100).optional(),
  vehiclePlate: z.string().max(20).optional(),
  issueDescription: z
    .string()
    .min(10, "Please describe the issue (min 10 chars)")
    .max(1000),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]),
  adminNotes: z.string().max(500).optional(),
});

export type CreateRepairBookingInput = z.infer<
  typeof createRepairBookingSchema
>;
export type UpdateBookingStatusInput = z.infer<
  typeof updateBookingStatusSchema
>;
