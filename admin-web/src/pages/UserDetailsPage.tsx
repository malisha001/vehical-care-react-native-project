import React from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { userApi } from "../api/endpoints";
import {
  CarrierRequest,
  CleaningBooking,
  RepairBooking,
  UserDetails,
} from "../types";
import Table from "../components/ui/Table";
import { statusBadge } from "../components/ui/Badge";

const formatDate = (value?: string) =>
  value ? format(new Date(value), "MMM dd, yyyy HH:mm") : "-";

const serviceName = (booking: CleaningBooking) =>
  typeof booking.serviceId === "object" ? booking.serviceId.name : "-";

const SummaryCard: React.FC<{ label: string; value: number }> = ({
  label,
  value,
}) => (
  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="mt-1 text-2xl font-bold text-gray-950">{value}</p>
  </div>
);

const Detail: React.FC<{ label: string; value?: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div>
    <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
    <p className="mt-1 text-sm font-medium text-gray-900">{value || "-"}</p>
  </div>
);

const UserDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<UserDetails>({
    queryKey: ["user-details", id],
    enabled: !!id,
    queryFn: () => userApi.getById(id!).then((r) => r.data.data),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate("/users")} className="btn-secondary">
          Back to users
        </button>
        <div className="card text-sm text-gray-500">User not found.</div>
      </div>
    );
  }

  const cleaningColumns = [
    {
      key: "createdAt",
      label: "Created",
      render: (v: unknown) => formatDate(v as string),
    },
    {
      key: "serviceId",
      label: "Service",
      render: (_: unknown, row: unknown) => serviceName(row as CleaningBooking),
    },
    { key: "date", label: "Slot Date" },
    { key: "timeSlot", label: "Time" },
    {
      key: "status",
      label: "Status",
      render: (v: unknown) => statusBadge(v as string),
    },
  ];

  const repairColumns = [
    {
      key: "createdAt",
      label: "Created",
      render: (v: unknown) => formatDate(v as string),
    },
    { key: "customerName", label: "Customer" },
    { key: "phone", label: "Phone" },
    { key: "requestedDate", label: "Requested Date" },
    {
      key: "status",
      label: "Status",
      render: (v: unknown) => statusBadge(v as string),
    },
  ];

  const carrierColumns = [
    {
      key: "createdAt",
      label: "Created",
      render: (v: unknown) => formatDate(v as string),
    },
    { key: "name", label: "Name" },
    { key: "mobile", label: "Mobile" },
    {
      key: "address",
      label: "Address",
      render: (v: unknown) => (
        <span className="line-clamp-1 max-w-sm">{v as string}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (v: unknown) => statusBadge(v as string),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/users")}
            className="text-sm font-medium text-primary-700 hover:text-primary-800"
          >
            Back to users
          </button>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">
            User Details
          </h1>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-950">
              {data.user.name}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{data.user.email}</p>
          </div>
          <div className="flex gap-2">
            <span className="badge bg-blue-100 text-blue-700">
              {data.user.role}
            </span>
            <span
              className={`badge ${
                data.user.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {data.user.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="grid gap-4 py-5 md:grid-cols-3">
          <Detail label="User ID" value={data.user._id} />
          <Detail label="Joined" value={formatDate(data.user.createdAt)} />
          <Detail label="Last Updated" value={formatDate(data.user.updatedAt)} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            label="Cleaning Bookings"
            value={data.stats.cleaningBookings}
          />
          <SummaryCard
            label="Repair Bookings"
            value={data.stats.repairBookings}
          />
          <SummaryCard
            label="Carrier Requests"
            value={data.stats.carrierRequests}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Cleaning Bookings
        </h2>
        <div className="card overflow-hidden p-0">
          <Table
            columns={cleaningColumns as Parameters<typeof Table>[0]["columns"]}
            data={data.recentCleaningBookings as CleaningBooking[]}
            emptyMessage="No cleaning bookings found"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Repair Bookings
        </h2>
        <div className="card overflow-hidden p-0">
          <Table
            columns={repairColumns as Parameters<typeof Table>[0]["columns"]}
            data={data.recentRepairBookings as RepairBooking[]}
            emptyMessage="No repair bookings found"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Carrier Requests
        </h2>
        <div className="card overflow-hidden p-0">
          <Table
            columns={carrierColumns as Parameters<typeof Table>[0]["columns"]}
            data={data.recentCarrierRequests as CarrierRequest[]}
            emptyMessage="No carrier requests found"
          />
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;
