export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface CleaningService {
  _id: string;
  name: string;
  description: string;
  price?: number;
  duration?: string;
  isActive: boolean;
}

export interface CleaningSlot {
  _id: string;
  serviceId: CleaningService | string;
  date: string;
  timeSlot: string;
  isAvailable: boolean;
  maxBookings: number;
  currentBookings: number;
}

export interface ModificationItem {
  _id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  images: string[];
  stockQty: number;
  isAvailable: boolean;
  tags: string[];
}

export interface RepairSlot {
  _id: string;
  date: string;
  timeSlot: string;
  isAvailable: boolean;
  maxBookings: number;
  currentBookings: number;
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type RepairBookingStatus =
  | "REQUESTED"
  | "PROPOSED"
  | "ACCEPTED"
  | "COMPLETED"
  | "CANCELLED";

export interface RepairBooking {
  _id: string;
  customerName: string;
  phone: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  requestedDate: string;
  scheduledDate?: string;
  estimatedDays?: number;
  issueDescription: string;
  status: RepairBookingStatus;
  adminNotes?: string;
  createdAt: string;
}

export interface CleaningBooking {
  _id: string;
  serviceId: CleaningService | string;
  vehicleModel?: string;
  vehiclePlate?: string;
  date: string;
  timeSlot: string;
  notes?: string;
  status: BookingStatus;
  adminNotes?: string;
  createdAt: string;
}

export type CarrierStatus =
  | "REQUESTED"
  | "ASSIGNED"
  | "COMPLETED"
  | "CANCELLED";

export interface CarrierRequest {
  _id: string;
  name: string;
  mobile: string;
  coordinates: { lat: number; lng: number };
  address: string;
  notes?: string;
  status: CarrierStatus;
  assignedDriver?: string;
  createdAt: string;
}
