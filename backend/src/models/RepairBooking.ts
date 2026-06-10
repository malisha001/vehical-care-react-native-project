import mongoose, { Document, Schema } from "mongoose";

export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type RepairBookingStatus =
  | "REQUESTED"
  | "PROPOSED"
  | "ACCEPTED"
  | "COMPLETED"
  | "CANCELLED";

export interface IRepairBooking extends Document {
  userId: mongoose.Types.ObjectId;
  customerName: string;
  phone: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  slotId?: mongoose.Types.ObjectId;
  requestedDate: string;
  scheduledDate?: string;
  estimatedDays?: number;
  date?: string;
  timeSlot?: string;
  issueDescription: string;
  status: RepairBookingStatus;
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

const RepairBillItemSchema = new Schema(
  {
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const RepairBookingSchema = new Schema<IRepairBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    vehicleModel: { type: String, trim: true },
    vehiclePlate: { type: String, trim: true, uppercase: true },
    slotId: { type: Schema.Types.ObjectId, ref: "RepairSlot" },
    requestedDate: { type: String, required: true, index: true },
    scheduledDate: { type: String, index: true },
    estimatedDays: { type: Number, min: 1 },
    date: { type: String, index: true },
    timeSlot: { type: String },
    issueDescription: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["REQUESTED", "PROPOSED", "ACCEPTED", "COMPLETED", "CANCELLED"],
      default: "REQUESTED",
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
    billItems: { type: [RepairBillItemSchema], default: [] },
    billTotal: { type: Number, min: 0, default: 0 },
    billFinalizedAt: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.model<IRepairBooking>(
  "RepairBooking",
  RepairBookingSchema,
);
