import mongoose, { Document, Schema } from "mongoose";

export interface ICleaningService extends Document {
  name: string;
  description: string;
  price?: number;
  duration?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CleaningServiceSchema = new Schema<ICleaningService>(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, min: 0 },
    duration: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model<ICleaningService>(
  "CleaningService",
  CleaningServiceSchema,
);
