import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { repairBookingApi } from "../api/endpoints";
import { RepairBooking, RepairBookingStatus } from "../types";
import Modal from "../components/ui/Modal";
import Table from "../components/ui/Table";
import { statusBadge } from "../components/ui/Badge";

const STATUSES: RepairBookingStatus[] = [
  "REQUESTED",
  "PROPOSED",
  "ACCEPTED",
  "COMPLETED",
  "CANCELLED",
];

const RepairBookingsPage: React.FC = () => {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [statusModal, setStatusModal] = useState<{
    booking: RepairBooking;
    status: RepairBookingStatus;
    scheduledDate: string;
    estimatedDays: number;
    notes: string;
  } | null>(null);

  const { data: res, isLoading } = useQuery({
    queryKey: ["repair-bookings", page, statusFilter, dateFilter],
    queryFn: () =>
      repairBookingApi
        .getAll({
          page,
          limit: 20,
          status: statusFilter || undefined,
          date: dateFilter || undefined,
        })
        .then((r) => r.data),
  });

  const bookings = (res?.data as RepairBooking[]) || [];
  const meta = res?.meta;

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        status: string;
        scheduledDate?: string;
        estimatedDays?: number;
        adminNotes?: string;
      };
    }) => repairBookingApi.updateStatus(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["repair-bookings"] });
      setStatusModal(null);
    },
  });

  const columns = [
    {
      key: "createdAt",
      label: "Created",
      render: (v: unknown) => format(new Date(v as string), "MMM dd, yyyy"),
    },
    {
      key: "userId",
      label: "User",
      render: (v: unknown, row: unknown) => {
        const booking = row as RepairBooking;
        const account = typeof v === "object" ? (v as { name: string }).name : "";
        return booking.customerName || account || "-";
      },
    },
    { key: "phone", label: "Phone" },
    {
      key: "vehiclePlate",
      label: "Vehicle",
      render: (v: unknown, row: unknown) =>
        `${(row as RepairBooking).vehicleModel || ""} ${v || ""}`.trim() || "-",
    },
    { key: "requestedDate", label: "Pickup Date" },
    {
      key: "scheduledDate",
      label: "Scheduled Date",
      render: (v: unknown, row: unknown) => {
        const booking = row as RepairBooking;
        return v
          ? `${v}${booking.estimatedDays ? ` (${booking.estimatedDays} days)` : ""}`
          : "-";
      },
    },
    {
      key: "issueDescription",
      label: "Description",
      render: (v: unknown) => (
        <span className="line-clamp-1 max-w-xs">{v as string}</span>
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
        const booking = row as RepairBooking;
        return (
          <button
            onClick={() =>
              setStatusModal({
                booking,
                status:
                  booking.status === "REQUESTED"
                    ? "PROPOSED"
                    : booking.status,
                scheduledDate: booking.scheduledDate || booking.requestedDate,
                estimatedDays: booking.estimatedDays || 1,
                notes: booking.adminNotes || "",
              })
            }
            className="btn-secondary text-xs px-3 py-1"
          >
            Review
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Repair Requests</h1>

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
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="input max-w-xs"
        />
        {(statusFilter || dateFilter) && (
          <button
            onClick={() => {
              setStatusFilter("");
              setDateFilter("");
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
        title="Review Repair Request"
      >
        {statusModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
              <p>
                <strong>Pickup date:</strong>{" "}
                {statusModal.booking.requestedDate}
              </p>
              <p className="mt-1">
                <strong>Description:</strong>{" "}
                {statusModal.booking.issueDescription}
              </p>
            </div>

            <div>
              <label className="label">Status</label>
              <select
                value={statusModal.status}
                onChange={(e) =>
                  setStatusModal((p) =>
                    p
                      ? { ...p, status: e.target.value as RepairBookingStatus }
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Scheduled Date</label>
                <input
                  type="date"
                  value={statusModal.scheduledDate}
                  onChange={(e) =>
                    setStatusModal((p) =>
                      p ? { ...p, scheduledDate: e.target.value } : null,
                    )
                  }
                  className="input"
                />
              </div>
              <div>
                <label className="label">Repair Days</label>
                <input
                  type="number"
                  min={1}
                  value={statusModal.estimatedDays}
                  onChange={(e) =>
                    setStatusModal((p) =>
                      p
                        ? {
                            ...p,
                            estimatedDays: parseInt(e.target.value) || 1,
                          }
                        : null,
                    )
                  }
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label">Message to User</label>
              <textarea
                value={statusModal.notes}
                onChange={(e) =>
                  setStatusModal((p) =>
                    p ? { ...p, notes: e.target.value } : null,
                  )
                }
                rows={3}
                className="input"
                placeholder="Explain the date change or repair duration..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  updateMutation.mutate({
                    id: statusModal.booking._id,
                    data: {
                      status: statusModal.status,
                      scheduledDate:
                        statusModal.status === "CANCELLED"
                          ? undefined
                          : statusModal.scheduledDate,
                      estimatedDays:
                        statusModal.status === "CANCELLED"
                          ? undefined
                          : statusModal.estimatedDays,
                      adminNotes: statusModal.notes,
                    },
                  })
                }
                disabled={updateMutation.isPending}
                className="btn-primary flex-1"
              >
                {updateMutation.isPending ? "Sending..." : "Send Update"}
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

export default RepairBookingsPage;
