import mongoose, { Document, Schema } from "mongoose";

export interface IModificationItem extends Document {
  name: string;
  brand: string;
  category: string;
  description: string;
  images: string[];
  stockQty: number;
  isAvailable: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ModificationItemSchema = new Schema<IModificationItem>(
  {
    name: { type: String, required: true, trim: true, index: true },
    brand: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    images: [{ type: String }],
    stockQty: { type: Number, required: true, min: 0, default: 0 },
    isAvailable: { type: Boolean, default: false },
    tags: [{ type: String, trim: true, index: true }],
  },
  { timestamps: true },
);

// Compute isAvailable based on stockQty
ModificationItemSchema.pre("save", function (next) {
  this.isAvailable = this.stockQty > 0;
  next();
});

ModificationItemSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as Record<string, unknown>;
  if (update && update.stockQty !== undefined) {
    (update as Record<string, unknown>).isAvailable =
      (update.stockQty as number) > 0;
  }
  next();
});

// Text index for search
ModificationItemSchema.index({
  name: "text",
  brand: "text",
  description: "text",
  tags: "text",
});

export default mongoose.model<IModificationItem>(
  "ModificationItem",
  ModificationItemSchema,
);
