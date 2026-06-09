import mongoose, { Document, Schema } from "mongoose";

export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type RepairBookingStatus =
  | "REQUESTED"
  | "PROPOSED"
  | "ACCEPTED"
  | "COMPLETED"
  | "CANCELLED";
export type BillStatus = "DRAFT" | "FINALIZED";

export interface IBillItem {
  description: string;
  amount: number;
}

export interface IBookingBill {
  items: IBillItem[];
  total: number;
  status: BillStatus;
  finalizedAt?: Date;
}

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
  bill: IBookingBill;
  createdAt: Date;
  updatedAt: Date;
}

const BillItemSchema = new Schema<IBillItem>(
  {
    description: { type: String, required: true, trim: true, maxlength: 120 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const BillSchema = new Schema<IBookingBill>(
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
    bill: { type: BillSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export default mongoose.model<IRepairBooking>(
  "RepairBooking",
  RepairBookingSchema,
);
