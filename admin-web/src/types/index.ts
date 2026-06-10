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
  updatedAt?: string;
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
  billStatus?: "DRAFT" | "FINALIZED";
  baseServicePrice?: number;
  billItems?: BillItem[];
  billTotal?: number;
  billFinalizedAt?: string;
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
  billStatus?: "DRAFT" | "FINALIZED";
  baseServicePrice?: number;
  billItems?: BillItem[];
  billTotal?: number;
  billFinalizedAt?: string;
  createdAt: string;
}

export interface BillItem {
  description: string;
  price: number;
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
  range?: "today" | "all";
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
  revenue: {
    total: number;
    vehicleService: number;
    repair: number;
    finalizedBills: number;
  };
}

export interface UserDetails {
  user: User;
  stats: {
    cleaningBookings: number;
    repairBookings: number;
    carrierRequests: number;
  };
  recentCleaningBookings: CleaningBooking[];
  recentRepairBookings: RepairBooking[];
  recentCarrierRequests: CarrierRequest[];
}
