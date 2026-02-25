import mongoose, { Document, Schema } from "mongoose";

export type CarrierStatus =
  | "REQUESTED"
  | "ASSIGNED"
  | "COMPLETED"
  | "CANCELLED";

export interface ICarrierRequest extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  mobile: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  notes?: string;
  status: CarrierStatus;
  assignedDriver?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CarrierRequestSchema = new Schema<ICarrierRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    address: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ["REQUESTED", "ASSIGNED", "COMPLETED", "CANCELLED"],
      default: "REQUESTED",
      index: true,
    },
    assignedDriver: { type: String, trim: true },
  },
  { timestamps: true },
);

export default mongoose.model<ICarrierRequest>(
  "CarrierRequest",
  CarrierRequestSchema,
);
