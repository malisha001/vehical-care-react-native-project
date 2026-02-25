import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { repairSlotApi } from "../api/endpoints";
import { RepairSlot } from "../types";
import Modal from "../components/ui/Modal";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";

const DEFAULT_TIME_SLOTS = [
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
];

const RepairSlotsPage: React.FC = () => {
  const qc = useQueryClient();
  const [bulkModal, setBulkModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState("");
  const [bulkData, setBulkData] = useState({
    startDate: "",
    endDate: "",
    timeSlots: DEFAULT_TIME_SLOTS,
    maxBookings: 1,
  });

  const { data: slots, isLoading } = useQuery({
    queryKey: ["repair-slots", dateFilter],
    queryFn: () =>
      repairSlotApi
        .getAll(dateFilter ? { date: dateFilter } : undefined)
        .then((r) => r.data.data),
  });

  const bulkMutation = useMutation({
    mutationFn: () => repairSlotApi.createBulk(bulkData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["repair-slots"] });
      setBulkModal(false);
    },
  });

  const toggleAvailability = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      repairSlotApi.update(id, { isAvailable }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["repair-slots"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => repairSlotApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["repair-slots"] });
      setDeleteId(null);
    },
  });

  const toggleTimeSlot = (ts: string) => {
    setBulkData((p) => ({
      ...p,
      timeSlots: p.timeSlots.includes(ts)
        ? p.timeSlots.filter((t) => t !== ts)
        : [...p.timeSlots, ts],
    }));
  };

  const columns = [
    { key: "date", label: "Date" },
    { key: "timeSlot", label: "Time Slot" },
    {
      key: "currentBookings",
      label: "Bookings",
      render: (v: unknown, row: unknown) =>
        `${v} / ${(row as RepairSlot).maxBookings}`,
    },
    {
      key: "isAvailable",
      label: "Status",
      render: (v: unknown) => (
        <Badge
          label={v ? "Available" : "Unavailable"}
          color={v ? "green" : "red"}
        />
      ),
    },
    {
      key: "_id",
      label: "Actions",
      render: (_: unknown, row: unknown) => {
        const s = row as RepairSlot;
        return (
          <div className="flex gap-2">
            <button
              onClick={() =>
                toggleAvailability.mutate({
                  id: s._id,
                  isAvailable: !s.isAvailable,
                })
              }
              className={`text-xs px-2 py-1 rounded-lg font-medium ${s.isAvailable ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
            >
              {s.isAvailable ? "Disable" : "Enable"}
            </button>
            <button
              onClick={() => setDeleteId(s._id)}
              className="btn-danger text-xs px-2 py-1"
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Repair Slots</h1>
        <button onClick={() => setBulkModal(true)} className="btn-primary">
          + Create Weekly Slots
        </button>
      </div>

      <div className="flex gap-3 items-center">
        <div>
          <label className="label">Filter by Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input"
          />
        </div>
        {dateFilter && (
          <button
            onClick={() => setDateFilter("")}
            className="btn-secondary mt-5"
          >
            Clear
          </button>
        )}
        <div className="ml-auto text-sm text-gray-500 mt-5">
          {slots?.length || 0} slots
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <Table
          columns={columns as Parameters<typeof Table>[0]["columns"]}
          data={(slots || []) as Record<string, unknown>[]}
          loading={isLoading}
        />
      </div>

      {/* Bulk Create Modal */}
      <Modal
        isOpen={bulkModal}
        onClose={() => setBulkModal(false)}
        title="Create Weekly Slots"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                value={bulkData.startDate}
                onChange={(e) =>
                  setBulkData((p) => ({ ...p, startDate: e.target.value }))
                }
                className="input"
              />
            </div>
            <div>
              <label className="label">End Date</label>
              <input
                type="date"
                value={bulkData.endDate}
                onChange={(e) =>
                  setBulkData((p) => ({ ...p, endDate: e.target.value }))
                }
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">Max Bookings per Slot</label>
            <input
              type="number"
              min={1}
              value={bulkData.maxBookings}
              onChange={(e) =>
                setBulkData((p) => ({
                  ...p,
                  maxBookings: parseInt(e.target.value) || 1,
                }))
              }
              className="input"
            />
          </div>
          <div>
            <label className="label">Time Slots (select all that apply)</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {DEFAULT_TIME_SLOTS.map((ts) => (
                <label
                  key={ts}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm ${bulkData.timeSlots.includes(ts) ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200"}`}
                >
                  <input
                    type="checkbox"
                    checked={bulkData.timeSlots.includes(ts)}
                    onChange={() => toggleTimeSlot(ts)}
                    className="sr-only"
                  />
                  {ts}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => bulkMutation.mutate()}
              disabled={
                bulkMutation.isPending ||
                !bulkData.startDate ||
                !bulkData.endDate ||
                bulkData.timeSlots.length === 0
              }
              className="btn-primary flex-1"
            >
              {bulkMutation.isPending ? "Creating..." : "Create Slots"}
            </button>
            <button
              onClick={() => setBulkModal(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirm Delete"
        size="sm"
      >
        <p className="text-gray-600 mb-6">Delete this slot?</p>
        <div className="flex gap-3">
          <button
            onClick={() => deleteMutation.mutate(deleteId!)}
            disabled={deleteMutation.isPending}
            className="btn-danger flex-1"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </button>
          <button
            onClick={() => setDeleteId(null)}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default RepairSlotsPage;
