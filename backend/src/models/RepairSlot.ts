import mongoose, { Document, Schema } from "mongoose";

export interface IRepairSlot extends Document {
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "09:00-10:00"
  isAvailable: boolean;
  maxBookings: number;
  currentBookings: number;
  createdAt: Date;
  updatedAt: Date;
}

const RepairSlotSchema = new Schema<IRepairSlot>(
  {
    date: { type: String, required: true, index: true },
    timeSlot: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    maxBookings: { type: Number, default: 1, min: 1 },
    currentBookings: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

// Compound unique index to prevent duplicate slots
RepairSlotSchema.index({ date: 1, timeSlot: 1 }, { unique: true });

export default mongoose.model<IRepairSlot>("RepairSlot", RepairSlotSchema);
