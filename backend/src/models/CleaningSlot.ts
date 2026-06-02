import mongoose, { Document, Schema } from "mongoose";

export interface ICleaningSlot extends Document {
  serviceId: mongoose.Types.ObjectId;
  date: string;
  timeSlot: string;
  isAvailable: boolean;
  maxBookings: number;
  currentBookings: number;
  createdAt: Date;
  updatedAt: Date;
}

const CleaningSlotSchema = new Schema<ICleaningSlot>(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "CleaningService",
      required: true,
      index: true,
    },
    date: { type: String, required: true, index: true },
    timeSlot: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    maxBookings: { type: Number, default: 1, min: 1 },
    currentBookings: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

CleaningSlotSchema.index(
  { serviceId: 1, date: 1, timeSlot: 1 },
  { unique: true },
);

export default mongoose.model<ICleaningSlot>("CleaningSlot", CleaningSlotSchema);
