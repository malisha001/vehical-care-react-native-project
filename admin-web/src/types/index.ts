export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
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
  createdAt: string;
}

export interface CleaningSlot {
  _id: string;
  serviceId: CleaningService | string;
  date: string;
  timeSlot: string;
  isAvailable: boolean;
  maxBookings: number;
  currentBookings: number;
  createdAt: string;
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
  createdAt: string;
}

export interface RepairSlot {
  _id: string;
  date: string;
  timeSlot: string;
  isAvailable: boolean;
  maxBookings: number;
  currentBookings: number;
  createdAt: string;
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type RepairBookingStatus =
  | "REQUESTED"
  | "PROPOSED"
  | "ACCEPTED"
  | "COMPLETED"
  | "CANCELLED";
export type BillStatus = "DRAFT" | "FINALIZED";

export interface BillItem {
  description: string;
  amount: number;
}

export interface BookingBill {
  items: BillItem[];
  total: number;
  status: BillStatus;
  finalizedAt?: string;
}

export interface RepairBooking {
  _id: string;
  userId: User | string;
  customerName: string;
  phone: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  slotId?: RepairSlot | string;
  requestedDate: string;
  scheduledDate?: string;
  estimatedDays?: number;
  date?: string;
  timeSlot?: string;
  issueDescription: string;
  status: RepairBookingStatus;
  adminNotes?: string;
  bill?: BookingBill;
  createdAt: string;
}

export interface CleaningBooking {
  _id: string;
  userId: User | string;
  serviceId: CleaningService | string;
  slotId: CleaningSlot | string;
  vehicleModel?: string;
  vehiclePlate?: string;
  date: string;
  timeSlot: string;
  notes?: string;
  status: BookingStatus;
  adminNotes?: string;
  bill?: BookingBill;
  createdAt: string;
}

export type CarrierStatus =
  | "REQUESTED"
  | "ASSIGNED"
  | "COMPLETED"
  | "CANCELLED";

export interface CarrierRequest {
  _id: string;
  userId: User | string;
  name: string;
  mobile: string;
  coordinates: { lat: number; lng: number };
  address: string;
  notes?: string;
  status: CarrierStatus;
  assignedDriver?: string;
  createdAt: string;
}

export interface DashboardMetrics {
  users: { total: number };
  cleaning: { active: number; bookings: number; pending: number };
  modification: { total: number; available: number };
  repairs: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
  };
  carrier: { total: number; active: number };
}
