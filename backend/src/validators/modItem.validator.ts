import { z } from "zod";

export const createModItemSchema = z.object({
  name: z.string().min(2).max(150),
  brand: z.string().min(1).max(100),
  category: z.string().min(1).max(100),
  description: z.string().min(5).max(1000),
  images: z.array(z.string().url()).optional().default([]),
  stockQty: z.number().int().min(0).default(0),
  tags: z.array(z.string()).optional().default([]),
});

export const updateModItemSchema = createModItemSchema.partial();

export const updateStockSchema = z.object({
  stockQty: z.number().int().min(0),
});

export type CreateModItemInput = z.infer<typeof createModItemSchema>;
export type UpdateModItemInput = z.infer<typeof updateModItemSchema>;
