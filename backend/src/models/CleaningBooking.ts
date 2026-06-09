import mongoose, { Document, Schema } from "mongoose";
import { BookingStatus, IBookingBill } from "./RepairBooking";

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
  bill: IBookingBill;
  createdAt: Date;
  updatedAt: Date;
}

const BillItemSchema = new Schema(
  {
    description: { type: String, required: true, trim: true, maxlength: 120 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const BillSchema = new Schema(
  {
    items: { type: [BillItemSchema], default: [] },
    total: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["DRAFT", "FINALIZED"],
      default: "DRAFT",
      index: true,
    },
    finalizedAt: { type: Date },
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
    bill: { type: BillSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export default mongoose.model<ICleaningBooking>(
  "CleaningBooking",
  CleaningBookingSchema,
);
