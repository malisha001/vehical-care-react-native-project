import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { cleaningApi, cleaningBookingApi } from "../api/endpoints";
import { BookingStatus, CleaningBooking, CleaningService } from "../types";
import Modal from "../components/ui/Modal";
import Table from "../components/ui/Table";
import { statusBadge } from "../components/ui/Badge";

const STATUSES: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];

const CleaningBookingsPage: React.FC = () => {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [page, setPage] = useState(1);
  const [statusModal, setStatusModal] = useState<{
    booking: CleaningBooking;
    status: BookingStatus;
    notes: string;
  } | null>(null);

  const { data: services = [] } = useQuery({
    queryKey: ["cleaning-services"],
    queryFn: () => cleaningApi.getAll().then((r) => r.data.data),
  });

  const { data: res, isLoading } = useQuery({
    queryKey: ["cleaning-bookings", page, statusFilter, dateFilter, serviceFilter],
    queryFn: () =>
      cleaningBookingApi
        .getAll({
          page,
          limit: 20,
          status: statusFilter || undefined,
          date: dateFilter || undefined,
          serviceId: serviceFilter || undefined,
        })
        .then((r) => r.data),
  });

  const bookings = (res?.data as CleaningBooking[]) || [];
  const meta = res?.meta;

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { status: string; adminNotes?: string };
    }) => cleaningBookingApi.updateStatus(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cleaning-bookings"] });
      setStatusModal(null);
    },
  });

  const serviceName = (serviceId: CleaningBooking["serviceId"]) => {
    if (typeof serviceId === "object") return serviceId.name;
    return services.find((s: CleaningService) => s._id === serviceId)?.name || "-";
  };

  const columns = [
    {
      key: "createdAt",
      label: "Created",
      render: (v: unknown) => format(new Date(v as string), "MMM dd, yyyy"),
    },
    {
      key: "userId",
      label: "User",
      render: (v: unknown) =>
        typeof v === "object" ? (v as { name: string }).name : "-",
    },
    {
      key: "serviceId",
      label: "Service",
      render: (v: unknown) => serviceName(v as CleaningBooking["serviceId"]),
    },
    {
      key: "vehiclePlate",
      label: "Vehicle",
      render: (v: unknown, row: unknown) =>
        `${(row as CleaningBooking).vehicleModel || ""} ${v || ""}`.trim() ||
        "-",
    },
    { key: "date", label: "Slot Date" },
    { key: "timeSlot", label: "Time Slot" },
    {
      key: "notes",
      label: "Notes",
      render: (v: unknown) => (
        <span className="line-clamp-1 max-w-xs">{(v as string) || "-"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (v: unknown) => statusBadge(v as string),
    },
    {
      key: "_id",
      label: "Actions",
      render: (_: unknown, row: unknown) => {
        const booking = row as CleaningBooking;
        return (
          <button
            onClick={() =>
              setStatusModal({
                booking,
                status: booking.status,
                notes: booking.adminNotes || "",
              })
            }
            className="btn-secondary text-xs px-3 py-1"
          >
            Update
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Cleaning Bookings</h1>

      <div className="flex gap-3 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input max-w-xs"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="input max-w-xs"
        >
          <option value="">All Services</option>
          {services.map((service: CleaningService) => (
            <option key={service._id} value={service._id}>
              {service.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="input max-w-xs"
        />
        {(statusFilter || dateFilter || serviceFilter) && (
          <button
            onClick={() => {
              setStatusFilter("");
              setDateFilter("");
              setServiceFilter("");
              setPage(1);
            }}
            className="btn-secondary"
          >
            Clear
          </button>
        )}
        <span className="ml-auto text-sm text-gray-500 self-end">
          {meta?.total ?? 0} total
        </span>
      </div>

      <div className="card p-0 overflow-hidden">
        <Table
          columns={columns as Parameters<typeof Table>[0]["columns"]}
          data={bookings}
          loading={isLoading}
        />
      </div>

      {meta && meta.total > 20 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn-secondary px-3 py-1"
          >
            Prev
          </button>
          <span className="text-sm self-center text-gray-600">
            Page {page} of {Math.ceil(meta.total / 20)}
          </span>
          <button
            disabled={page >= Math.ceil(meta.total / 20)}
            onClick={() => setPage((p) => p + 1)}
            className="btn-secondary px-3 py-1"
          >
            Next
          </button>
        </div>
      )}

      <Modal
        isOpen={!!statusModal}
        onClose={() => setStatusModal(null)}
        title="Update Cleaning Booking"
      >
        {statusModal && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">
                Service: {serviceName(statusModal.booking.serviceId)}
              </p>
              {statusModal.booking.notes && (
                <p className="text-sm text-gray-500">
                  Notes: {statusModal.booking.notes}
                </p>
              )}
            </div>
            <div>
              <label className="label">Status</label>
              <select
                value={statusModal.status}
                onChange={(e) =>
                  setStatusModal((p) =>
                    p
                      ? { ...p, status: e.target.value as BookingStatus }
                      : null,
                  )
                }
                className="input"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Admin Notes (optional)</label>
              <textarea
                value={statusModal.notes}
                onChange={(e) =>
                  setStatusModal((p) =>
                    p ? { ...p, notes: e.target.value } : null,
                  )
                }
                rows={3}
                className="input"
                placeholder="Add notes for the user..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  updateMutation.mutate({
                    id: statusModal.booking._id,
                    data: {
                      status: statusModal.status,
                      adminNotes: statusModal.notes,
                    },
                  })
                }
                disabled={updateMutation.isPending}
                className="btn-primary flex-1"
              >
                {updateMutation.isPending ? "Updating..." : "Update Status"}
              </button>
              <button
                onClick={() => setStatusModal(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CleaningBookingsPage;
