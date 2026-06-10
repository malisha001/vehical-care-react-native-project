import api from "./axios";
import {
  AuthTokens,
  CleaningBooking,
  CleaningService,
  CleaningSlot,
  DashboardMetrics,
  ModificationItem,
  RepairBooking,
  CarrierRequest,
  RepairSlot,
} from "../types";
import { ApiResponse } from "../types";

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthTokens>>("/auth/login", data),
  logout: () => api.post<ApiResponse>("/auth/logout"),
};

// Dashboard
export const dashboardApi = {
  getMetrics: () =>
    api.get<ApiResponse<DashboardMetrics>>("/dashboard/metrics"),
};

// Cleaning Services
export const cleaningApi = {
  getAll: (params?: { isActive?: boolean }) =>
    api.get<ApiResponse<CleaningService[]>>("/cleaning-services", { params }),
  getById: (id: string) =>
    api.get<ApiResponse<CleaningService>>(`/cleaning-services/${id}`),
  create: (data: Partial<CleaningService>) =>
    api.post<ApiResponse<CleaningService>>("/cleaning-services", data),
  update: (id: string, data: Partial<CleaningService>) =>
    api.put<ApiResponse<CleaningService>>(`/cleaning-services/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/cleaning-services/${id}`),
};

export const cleaningSlotApi = {
  getAll: (params?: { serviceId?: string; date?: string }) =>
    api.get<ApiResponse<CleaningSlot[]>>("/cleaning-slots", { params }),
  createBulk: (data: {
    serviceId: string;
    startDate: string;
    endDate: string;
    timeSlots: string[];
    maxBookings?: number;
  }) => api.post<ApiResponse<CleaningSlot[]>>("/cleaning-slots/bulk", data),
  update: (id: string, data: Partial<CleaningSlot>) =>
    api.put<ApiResponse<CleaningSlot>>(`/cleaning-slots/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/cleaning-slots/${id}`),
};

export const cleaningBookingApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    date?: string;
    fromDate?: string;
    toDate?: string;
    serviceId?: string;
  }) => api.get<ApiResponse<CleaningBooking[]>>("/cleaning-bookings", { params }),
  updateStatus: (id: string, data: { status: string; adminNotes?: string }) =>
    api.patch<ApiResponse<CleaningBooking>>(
      `/cleaning-bookings/${id}/status`,
      data,
    ),
};

// Modification Items
export const modItemApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<ModificationItem[]>>("/mod-items", { params }),
  getById: (id: string) =>
    api.get<ApiResponse<ModificationItem>>(`/mod-items/${id}`),
  create: (data: Partial<ModificationItem>) =>
    api.post<ApiResponse<ModificationItem>>("/mod-items", data),
  update: (id: string, data: Partial<ModificationItem>) =>
    api.put<ApiResponse<ModificationItem>>(`/mod-items/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/mod-items/${id}`),
  updateStock: (id: string, stockQty: number) =>
    api.patch<ApiResponse<ModificationItem>>(`/mod-items/${id}/stock`, {
      stockQty,
    }),
  getCategories: () =>
    api.get<ApiResponse<string[]>>("/mod-items/meta/categories"),
  getBrands: () => api.get<ApiResponse<string[]>>("/mod-items/meta/brands"),
};

// Repair Slots
export const repairSlotApi = {
  getAll: (params?: { date?: string }) =>
    api.get<ApiResponse<RepairSlot[]>>("/repair-slots", { params }),
  create: (data: Partial<RepairSlot>) =>
    api.post<ApiResponse<RepairSlot>>("/repair-slots", data),
  createBulk: (data: {
    startDate: string;
    endDate: string;
    timeSlots: string[];
    maxBookings?: number;
  }) => api.post<ApiResponse<RepairSlot[]>>("/repair-slots/bulk", data),
  update: (id: string, data: Partial<RepairSlot>) =>
    api.put<ApiResponse<RepairSlot>>(`/repair-slots/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/repair-slots/${id}`),
};

// Repair Bookings
export const repairBookingApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    date?: string;
  }) => api.get<ApiResponse<RepairBooking[]>>("/repair-bookings", { params }),
  updateStatus: (
    id: string,
    data: {
      status: string;
      scheduledDate?: string;
      estimatedDays?: number;
      adminNotes?: string;
    },
  ) =>
    api.patch<ApiResponse<RepairBooking>>(
      `/repair-bookings/${id}/status`,
      data,
    ),
};

// Carrier Requests
export const carrierRequestApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<CarrierRequest[]>>("/carrier-requests", { params }),
  updateStatus: (
    id: string,
    data: { status: string; assignedDriver?: string },
  ) =>
    api.patch<ApiResponse<CarrierRequest>>(
      `/carrier-requests/${id}/status`,
      data,
    ),
};
