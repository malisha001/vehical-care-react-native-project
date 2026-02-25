import api from "./axios";
import {
  ApiResponse,
  AuthTokens,
  CleaningService,
  ModificationItem,
  RepairSlot,
  RepairBooking,
  CarrierRequest,
} from "../types";

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<ApiResponse<{ _id: string; name: string; email: string }>>(
      "/auth/register",
      data,
    ),
  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthTokens>>("/auth/login", data),
  refresh: (refreshToken: string) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      "/auth/refresh",
      { refreshToken },
    ),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get<ApiResponse>("/auth/profile"),
};

export const cleaningApi = {
  getAll: () =>
    api.get<ApiResponse<CleaningService[]>>("/cleaning-services?isActive=true"),
  getById: (id: string) =>
    api.get<ApiResponse<CleaningService>>(`/cleaning-services/${id}`),
};

export const modItemApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<ModificationItem[]>>("/mod-items", {
      params: { ...params, isAvailable: undefined },
    }),
  getById: (id: string) =>
    api.get<ApiResponse<ModificationItem>>(`/mod-items/${id}`),
  getCategories: () =>
    api.get<ApiResponse<string[]>>("/mod-items/meta/categories"),
  getBrands: () => api.get<ApiResponse<string[]>>("/mod-items/meta/brands"),
};

export const repairSlotApi = {
  getAvailable: (date?: string) =>
    api.get<ApiResponse<RepairSlot[]>>("/repair-slots/available", {
      params: date ? { date } : {},
    }),
};

export const repairBookingApi = {
  create: (data: {
    slotId: string;
    vehicleModel?: string;
    vehiclePlate?: string;
    issueDescription: string;
  }) => api.post<ApiResponse<RepairBooking>>("/repair-bookings", data),
  getMyBookings: (page = 1) =>
    api.get<ApiResponse<RepairBooking[]>>("/repair-bookings/my", {
      params: { page, limit: 10 },
    }),
};

export const carrierRequestApi = {
  create: (data: {
    name: string;
    mobile: string;
    coordinates: { lat: number; lng: number };
    address: string;
    notes?: string;
  }) => api.post<ApiResponse<CarrierRequest>>("/carrier-requests", data),
  getMyRequests: (page = 1) =>
    api.get<ApiResponse<CarrierRequest[]>>("/carrier-requests/my", {
      params: { page, limit: 10 },
    }),
};
