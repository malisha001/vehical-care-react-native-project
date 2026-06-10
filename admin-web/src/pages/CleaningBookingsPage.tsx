import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  const [fromDateFilter, setFromDateFilter] = useState("");
  const [toDateFilter, setToDateFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [page, setPage] = useState(1);
  const [reportLoading, setReportLoading] = useState(false);
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
    queryKey: [
      "cleaning-bookings",
      page,
      statusFilter,
      fromDateFilter,
      toDateFilter,
      serviceFilter,
    ],
    queryFn: () =>
      cleaningBookingApi
        .getAll({
          page,
          limit: 20,
          status: statusFilter || undefined,
          fromDate: fromDateFilter || undefined,
          toDate: toDateFilter || undefined,
          serviceId: serviceFilter || undefined,
        })
        .then((r) => r.data),
  });

  const bookings = (res?.data as CleaningBooking[]) || [];
  const meta = res?.meta;
  const hasFilters =
    statusFilter || fromDateFilter || toDateFilter || serviceFilter;

  const updateFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

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

  const userName = (userId: CleaningBooking["userId"]) => {
    if (typeof userId === "object") return userId.name;
    return "-";
  };

  const vehicleText = (booking: CleaningBooking) =>
    `${booking.vehicleModel || ""} ${booking.vehiclePlate || ""}`.trim() || "-";

  const generatePdfReport = async () => {
    try {
      setReportLoading(true);
      const reportLimit = Math.max(meta?.total ?? 5000, 1);
      const response = await cleaningBookingApi.getAll({
        page: 1,
        limit: reportLimit,
        status: statusFilter || undefined,
        fromDate: fromDateFilter || undefined,
        toDate: toDateFilter || undefined,
        serviceId: serviceFilter || undefined,
      });
      const reportBookings = response.data.data || [];
      const reportMeta = response.data.meta;
      const generatedAt = format(new Date(), "MMM dd, yyyy HH:mm");
      const selectedService =
        services.find((s: CleaningService) => s._id === serviceFilter)?.name ||
        "All Services";
      const dateRange =
        fromDateFilter || toDateFilter
          ? `${fromDateFilter || "Any"} to ${toDateFilter || "Any"}`
          : "All Dates";
      const statusCounts = STATUSES.reduce<Record<BookingStatus, number>>(
        (acc, status) => {
          acc[status] = reportBookings.filter((b) => b.status === status).length;
          return acc;
        },
        {
          PENDING: 0,
          CONFIRMED: 0,
          COMPLETED: 0,
          CANCELLED: 0,
        },
      );

      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(18);
      doc.text("Cleaning Bookings Report", 14, 16);
      doc.setFontSize(10);
      doc.text(`Generated: ${generatedAt}`, 14, 24);
      doc.text(`Service: ${selectedService}`, 14, 31);
      doc.text(`Status: ${statusFilter || "All Statuses"}`, 14, 38);
      doc.text(`Slot Date Range: ${dateRange}`, 14, 45);
      doc.text(`Total Bookings: ${reportMeta?.total ?? reportBookings.length}`, 14, 52);
      doc.text(
        `Pending: ${statusCounts.PENDING}   Confirmed: ${statusCounts.CONFIRMED}   Completed: ${statusCounts.COMPLETED}   Cancelled: ${statusCounts.CANCELLED}`,
        14,
        59,
      );

      autoTable(doc, {
        startY: 68,
        head: [
          [
            "Created",
            "Slot Date",
            "Time Slot",
            "Customer",
            "Service",
            "Vehicle",
            "Status",
            "Notes",
          ],
        ],
        body: reportBookings.map((booking) => [
          format(new Date(booking.createdAt), "yyyy-MM-dd"),
          booking.date,
          booking.timeSlot,
          userName(booking.userId),
          serviceName(booking.serviceId),
          vehicleText(booking),
          booking.status,
          booking.notes || "-",
        ]),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [31, 41, 55] },
        columnStyles: {
          7: { cellWidth: 54 },
        },
        margin: { left: 14, right: 14 },
      });

      const filenameDate = format(new Date(), "yyyy-MM-dd-HHmm");
      doc.save(`cleaning-bookings-report-${filenameDate}.pdf`);
    } catch {
      window.alert("Could not generate the cleaning bookings PDF report.");
    } finally {
      setReportLoading(false);
    }
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
          onChange={(e) => updateFilter(setStatusFilter, e.target.value)}
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
          onChange={(e) => updateFilter(setServiceFilter, e.target.value)}
          className="input max-w-xs"
        >
          <option value="">All Services</option>
          {services.map((service: CleaningService) => (
            <option key={service._id} value={service._id}>
              {service.name}
            </option>
          ))}
        </select>
        <div className="flex items-end gap-2">
          <label className="text-xs font-medium text-gray-500">
            From
            <input
              type="date"
              value={fromDateFilter}
              max={toDateFilter || undefined}
              onChange={(e) => updateFilter(setFromDateFilter, e.target.value)}
              className="input mt-1 max-w-xs"
            />
          </label>
          <label className="text-xs font-medium text-gray-500">
            To
            <input
              type="date"
              value={toDateFilter}
              min={fromDateFilter || undefined}
              onChange={(e) => updateFilter(setToDateFilter, e.target.value)}
              className="input mt-1 max-w-xs"
            />
          </label>
        </div>
        {hasFilters && (
          <button
            onClick={() => {
              setStatusFilter("");
              setFromDateFilter("");
              setToDateFilter("");
              setServiceFilter("");
              setPage(1);
            }}
            className="btn-secondary"
          >
            Clear
          </button>
        )}
        <button
          onClick={generatePdfReport}
          disabled={reportLoading || isLoading}
          className="btn-primary"
        >
          {reportLoading ? "Generating..." : "Download PDF"}
        </button>
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
