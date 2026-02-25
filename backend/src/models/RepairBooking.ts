import mongoose, { Document, Schema } from "mongoose";

export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface IRepairBooking extends Document {
  userId: mongoose.Types.ObjectId;
  vehicleModel?: string;
  vehiclePlate?: string;
  slotId: mongoose.Types.ObjectId;
  date: string;
  timeSlot: string;
  issueDescription: string;
  status: BookingStatus;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RepairBookingSchema = new Schema<IRepairBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    vehicleModel: { type: String, trim: true },
    vehiclePlate: { type: String, trim: true, uppercase: true },
    slotId: { type: Schema.Types.ObjectId, ref: "RepairSlot", required: true },
    date: { type: String, required: true, index: true },
    timeSlot: { type: String, required: true },
    issueDescription: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    adminNotes: { type: String, trim: true },
  },
  { timestamps: true },
);

export default mongoose.model<IRepairBooking>(
  "RepairBooking",
  RepairBookingSchema,
);
