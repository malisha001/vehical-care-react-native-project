import mongoose, { Document, Schema } from "mongoose";
import { BookingStatus } from "./RepairBooking";

export interface ICleaningBooking extends Document {
  userId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  slotId: mongoose.Types.ObjectId;
  vehicleModel?: string;
  vehiclePlate?: string;
  date: string;
  timeSlot: string;
  notes?: string;
  status: BookingStatus;
  adminNotes?: string;
  billStatus: "DRAFT" | "FINALIZED";
  baseServicePrice: number;
  billItems: {
    description: string;
    price: number;
  }[];
  billTotal: number;
  billFinalizedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CleaningBillItemSchema = new Schema(
  {
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const CleaningBookingSchema = new Schema<ICleaningBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "CleaningService",
      required: true,
      index: true,
    },
    slotId: { type: Schema.Types.ObjectId, ref: "CleaningSlot", required: true },
    vehicleModel: { type: String, trim: true },
    vehiclePlate: { type: String, trim: true, uppercase: true },
    date: { type: String, required: true, index: true },
    timeSlot: { type: String, required: true },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    adminNotes: { type: String, trim: true },
    billStatus: {
      type: String,
      enum: ["DRAFT", "FINALIZED"],
      default: "DRAFT",
      index: true,
    },
    baseServicePrice: { type: Number, min: 0, default: 0 },
    billItems: { type: [CleaningBillItemSchema], default: [] },
    billTotal: { type: Number, min: 0, default: 0 },
    billFinalizedAt: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.model<ICleaningBooking>(
  "CleaningBooking",
  CleaningBookingSchema,
);
