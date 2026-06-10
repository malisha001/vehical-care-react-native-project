import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { repairBookingApi } from "../api/endpoints";
import { BillItem, RepairBooking, RepairBookingStatus } from "../types";
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
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [statusModal, setStatusModal] = useState<{
    booking: RepairBooking;
    status: RepairBookingStatus;
    scheduledDate: string;
    estimatedDays: number;
    notes: string;
    baseServicePrice: string;
    billItems: { description: string; price: string }[];
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

  const billMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        billStatus: "DRAFT" | "FINALIZED";
        baseServicePrice: number;
        billItems: BillItem[];
      };
      openBillAfterSave?: boolean;
    }) => repairBookingApi.updateBill(id, data),
    onSuccess: (response, variables) => {
      qc.invalidateQueries({ queryKey: ["repair-bookings"] });
      setStatusModal(null);
      if (variables.openBillAfterSave) {
        navigate(`/repair-bookings/${response.data.data._id}/bill`);
      }
    },
  });

  const formatMoney = (value?: number) =>
    `LKR ${(value ?? 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const modalBillItems = (statusModal?.billItems ?? []).map((item) => ({
    description: item.description.trim(),
    price: Number(item.price) || 0,
  }));
  const modalBasePrice = Number(statusModal?.baseServicePrice) || 0;
  const modalBillTotal =
    modalBasePrice +
    modalBillItems.reduce((total, item) => total + item.price, 0);

  const saveBill = (
    billStatus: "DRAFT" | "FINALIZED",
    openBillAfterSave = false,
  ) => {
    if (!statusModal) return;
    const billItems = modalBillItems.filter(
      (item) => item.description && item.price >= 0,
    );
    if (billItems.length !== modalBillItems.length) {
      window.alert("Please add a description for every bill item.");
      return;
    }
    billMutation.mutate({
      id: statusModal.booking._id,
      data: {
        billStatus,
        baseServicePrice: modalBasePrice,
        billItems,
      },
      openBillAfterSave,
    });
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
      key: "billTotal",
      label: "Bill",
      render: (_: unknown, row: unknown) => {
        const booking = row as RepairBooking;
        return (
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {formatMoney(booking.billTotal)}
            </p>
            <p className="text-xs text-gray-500">
              {booking.billStatus === "FINALIZED" ? "Finalized" : "Draft"}
            </p>
          </div>
        );
      },
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
                baseServicePrice: String(booking.baseServicePrice ?? 0),
                billItems: (booking.billItems || []).map((item) => ({
                  description: item.description,
                  price: String(item.price),
                })),
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
        size="lg"
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

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    Billing
                  </h4>
                  <p className="text-xs text-gray-500">
                    Add labor, parts, or extra repair services, then finalize the bill.
                  </p>
                </div>
                <span className="badge bg-gray-100 text-gray-700">
                  {statusModal.booking.billStatus === "FINALIZED"
                    ? "Finalized"
                    : "Draft"}
                </span>
              </div>
              <label className="label">Base Repair / Labor Charge</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={statusModal.baseServicePrice}
                onChange={(e) =>
                  setStatusModal((p) =>
                    p ? { ...p, baseServicePrice: e.target.value } : null,
                  )
                }
                className="input mb-3"
              />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="label mb-0">Parts and Extra Services</label>
                  <button
                    type="button"
                    onClick={() =>
                      setStatusModal((p) =>
                        p
                          ? {
                              ...p,
                              billItems: [
                                ...p.billItems,
                                { description: "", price: "0" },
                              ],
                            }
                          : null,
                      )
                    }
                    className="btn-secondary px-3 py-1 text-xs"
                  >
                    Add Item
                  </button>
                </div>
                {statusModal.billItems.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-gray-300 px-3 py-3 text-sm text-gray-500">
                    No repair parts or extra services added yet.
                  </p>
                ) : (
                  statusModal.billItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-[1fr_120px_auto] gap-2">
                      <input
                        value={item.description}
                        onChange={(e) =>
                          setStatusModal((p) =>
                            p
                              ? {
                                  ...p,
                                  billItems: p.billItems.map((billItem, i) =>
                                    i === index
                                      ? {
                                          ...billItem,
                                          description: e.target.value,
                                        }
                                      : billItem,
                                  ),
                                }
                              : null,
                          )
                        }
                        className="input"
                        placeholder="Part or service name"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) =>
                          setStatusModal((p) =>
                            p
                              ? {
                                  ...p,
                                  billItems: p.billItems.map((billItem, i) =>
                                    i === index
                                      ? { ...billItem, price: e.target.value }
                                      : billItem,
                                  ),
                                }
                              : null,
                          )
                        }
                        className="input"
                        placeholder="Price"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setStatusModal((p) =>
                            p
                              ? {
                                  ...p,
                                  billItems: p.billItems.filter(
                                    (_, i) => i !== index,
                                  ),
                                }
                              : null,
                          )
                        }
                        className="btn-danger px-3 py-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-600">Final Total</span>
                  <span className="text-lg font-bold text-gray-950">
                    {formatMoney(modalBillTotal)}
                  </span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => saveBill("DRAFT")}
                  disabled={billMutation.isPending}
                  className="btn-secondary"
                >
                  {billMutation.isPending ? "Saving..." : "Save Draft Bill"}
                </button>
                <button
                  type="button"
                  onClick={() => saveBill("FINALIZED", true)}
                  disabled={billMutation.isPending}
                  className="btn-success"
                >
                  {billMutation.isPending ? "Finalizing..." : "Finalize Bill"}
                </button>
              </div>
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
