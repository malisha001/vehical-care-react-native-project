import { z } from "zod";

export const createCleaningServiceSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(5).max(500),
  price: z.number().min(0).optional(),
  duration: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateCleaningServiceSchema =
  createCleaningServiceSchema.partial();

export type CreateCleaningServiceInput = z.infer<
  typeof createCleaningServiceSchema
>;
export type UpdateCleaningServiceInput = z.infer<
  typeof updateCleaningServiceSchema
>;
