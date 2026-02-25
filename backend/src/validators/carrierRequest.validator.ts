import { z } from "zod";

export const createCarrierRequestSchema = z.object({
  name: z.string().min(2).max(100),
  mobile: z.string().regex(/^[0-9+\-\s()]{7,20}$/, "Invalid mobile number"),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  address: z.string().min(5).max(300),
  notes: z.string().max(500).optional(),
});

export const updateCarrierStatusSchema = z.object({
  status: z.enum(["REQUESTED", "ASSIGNED", "COMPLETED", "CANCELLED"]),
  assignedDriver: z.string().max(100).optional(),
});

export type CreateCarrierRequestInput = z.infer<
  typeof createCarrierRequestSchema
>;
export type UpdateCarrierStatusInput = z.infer<
  typeof updateCarrierStatusSchema
>;
