import { z } from "zod";

export const createCleaningBookingSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
  slotId: z.string().min(1, "Slot ID is required"),
  vehicleModel: z.string().max(100).optional(),
  vehiclePlate: z.string().max(20).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateCleaningBookingStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]),
  adminNotes: z.string().max(500).optional(),
});

export const updateCleaningBookingBillSchema = z.object({
  items: z
    .array(
      z.object({
        description: z.string().min(2, "Item description is required").max(120),
        amount: z.number().min(0, "Amount cannot be negative"),
      }),
    )
    .max(30)
    .default([]),
  finalize: z.boolean().optional(),
});

export type CreateCleaningBookingInput = z.infer<
  typeof createCleaningBookingSchema
>;
export type UpdateCleaningBookingStatusInput = z.infer<
  typeof updateCleaningBookingStatusSchema
>;
export type UpdateCleaningBookingBillInput = z.infer<
  typeof updateCleaningBookingBillSchema
>;
