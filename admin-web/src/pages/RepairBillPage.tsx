import React from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate, useParams } from "react-router-dom";
import { repairBookingApi } from "../api/endpoints";
import { BillItem, RepairBooking } from "../types";
import { statusBadge } from "../components/ui/Badge";

const formatMoney = (value?: number) =>
  `LKR ${(value ?? 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const userName = (booking: RepairBooking) =>
  typeof booking.userId === "object" ? booking.userId.name : booking.customerName;

const userEmail = (booking: RepairBooking) =>
  typeof booking.userId === "object" ? booking.userId.email : "-";

const vehicleText = (booking: RepairBooking) =>
  `${booking.vehicleModel || ""} ${booking.vehiclePlate || ""}`.trim() || "-";

const billRows = (booking: RepairBooking): BillItem[] => [
  {
    description: "Base repair / labor charge",
    price: booking.baseServicePrice ?? 0,
  },
  ...(booking.billItems || []),
];

const Detail: React.FC<{ label: string; value?: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div>
    <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
    <p className="mt-1 text-sm font-medium text-gray-900">{value || "-"}</p>
  </div>
);

const lastTableY = (doc: jsPDF) =>
  (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY;

const RepairBillPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: booking, isLoading } = useQuery({
    queryKey: ["repair-booking-bill", id],
    enabled: !!id,
    queryFn: () => repairBookingApi.getById(id!).then((r) => r.data.data),
  });

  const printBill = () => {
    if (!booking) return;

    const generatedAt = format(new Date(), "MMM dd, yyyy HH:mm");
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Vehicle Service Center", 14, 16);
    doc.setFontSize(14);
    doc.text("Repair Service Bill", 14, 25);
    doc.setFontSize(10);
    doc.text(`Generated: ${generatedAt}`, 14, 33);
    doc.text(`Bill Status: ${booking.billStatus || "DRAFT"}`, 14, 40);
    if (booking.billFinalizedAt) {
      doc.text(
        `Finalized: ${format(new Date(booking.billFinalizedAt), "MMM dd, yyyy HH:mm")}`,
        14,
        47,
      );
    }

    autoTable(doc, {
      startY: 56,
      theme: "plain",
      body: [
        ["Customer", userName(booking), "Email", userEmail(booking)],
        ["Phone", booking.phone, "Booking Status", booking.status],
        ["Vehicle", vehicleText(booking), "Requested Date", booking.requestedDate],
        [
          "Scheduled Date",
          booking.scheduledDate || "-",
          "Repair Days",
          booking.estimatedDays ? String(booking.estimatedDays) : "-",
        ],
        ["Issue", booking.issueDescription, "Admin Notes", booking.adminNotes || "-"],
      ],
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: "bold", textColor: [75, 85, 99] },
        2: { fontStyle: "bold", textColor: [75, 85, 99] },
      },
    });

    autoTable(doc, {
      startY: (lastTableY(doc) ?? 96) + 10,
      head: [["Description", "Price"]],
      body: billRows(booking).map((item) => [
        item.description,
        formatMoney(item.price),
      ]),
      foot: [["Final Total", formatMoney(booking.billTotal)]],
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [31, 41, 55] },
      footStyles: { fillColor: [16, 185, 129], fontStyle: "bold" },
      columnStyles: {
        1: { halign: "right" },
      },
    });

    doc.save(`repair-bill-${booking._id}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          Back
        </button>
        <div className="card text-sm text-gray-500">Bill not found.</div>
      </div>
    );
  }

  const rows = billRows(booking);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/repair-bookings")}
            className="text-sm font-medium text-primary-700 hover:text-primary-800"
          >
            Back to repair requests
          </button>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">
            Repair Bill
          </h1>
          <p className="text-sm text-gray-500">Booking #{booking._id}</p>
        </div>
        <button onClick={printBill} className="btn-primary">
          Print Bill
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">
              Final Total
            </p>
            <p className="mt-1 text-3xl font-bold text-gray-950">
              {formatMoney(booking.billTotal)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {statusBadge(booking.status)}
            <span className="badge bg-emerald-100 text-emerald-700">
              {booking.billStatus === "FINALIZED" ? "Bill Finalized" : "Draft Bill"}
            </span>
          </div>
        </div>

        <div className="grid gap-4 py-5 md:grid-cols-4">
          <Detail label="Customer" value={userName(booking)} />
          <Detail label="Email" value={userEmail(booking)} />
          <Detail label="Phone" value={booking.phone} />
          <Detail label="Vehicle" value={vehicleText(booking)} />
          <Detail label="Requested Date" value={booking.requestedDate} />
          <Detail label="Scheduled Date" value={booking.scheduledDate} />
          <Detail label="Repair Days" value={booking.estimatedDays} />
          <Detail
            label="Finalized"
            value={
              booking.billFinalizedAt
                ? format(new Date(booking.billFinalizedAt), "MMM dd, yyyy HH:mm")
                : "Not finalized"
            }
          />
        </div>

        <div className="grid gap-4 border-t border-gray-100 pt-5 md:grid-cols-2">
          <Detail label="Issue Description" value={booking.issueDescription} />
          <Detail label="Admin Notes" value={booking.adminNotes} />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Bill Item
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                Price
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {rows.map((item, index) => (
              <tr key={`${item.description}-${index}`}>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                  {item.description}
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                  {formatMoney(item.price)}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50">
              <td className="px-4 py-4 text-base font-bold text-gray-950">
                Final Total
              </td>
              <td className="px-4 py-4 text-right text-base font-bold text-gray-950">
                {formatMoney(booking.billTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RepairBillPage;
