import { z } from "zod";

export const createRepairBookingSchema = z.object({
  customerName: z.string().min(2, "Name is required").max(100),
  phone: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => /^\d{10}$/.test(value), {
      message: "Phone number must be a valid 10-digit number",
    }),
  requestedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pickup date must be YYYY-MM-DD"),
  vehicleModel: z.string().max(100).optional(),
  vehiclePlate: z.string().max(20).optional(),
  issueDescription: z
    .string()
    .min(10, "Please describe the issue (min 10 chars)")
    .max(1000),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(["REQUESTED", "PROPOSED", "ACCEPTED", "COMPLETED", "CANCELLED"]),
  scheduledDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  estimatedDays: z.number().int().min(1).optional(),
  adminNotes: z.string().max(500).optional(),
});

export const userRepairDecisionSchema = z.object({
  decision: z.enum(["ACCEPT", "CANCEL"]),
});

export const updateRepairBookingBillSchema = z.object({
  billStatus: z.enum(["DRAFT", "FINALIZED"]).optional(),
  baseServicePrice: z.number().min(0).optional(),
  billItems: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required").max(120),
        price: z.number().min(0),
      }),
    )
    .optional(),
});

export type CreateRepairBookingInput = z.infer<
  typeof createRepairBookingSchema
>;
export type UpdateBookingStatusInput = z.infer<
  typeof updateBookingStatusSchema
>;
export type UserRepairDecisionInput = z.infer<typeof userRepairDecisionSchema>;
export type UpdateRepairBookingBillInput = z.infer<
  typeof updateRepairBookingBillSchema
>;
