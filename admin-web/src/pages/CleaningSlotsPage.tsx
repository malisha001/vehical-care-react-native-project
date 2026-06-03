import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cleaningApi, cleaningSlotApi } from "../api/endpoints";
import { CleaningService, CleaningSlot } from "../types";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Table from "../components/ui/Table";

const DEFAULT_SLOT_MINUTES = 30;
const WORK_PERIODS = [
  { start: "08:00", end: "13:00" },
  { start: "14:00", end: "18:00" },
];

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const durationToMinutes = (duration?: string) => {
  if (!duration) return DEFAULT_SLOT_MINUTES;

  const normalized = duration.trim().toLowerCase();
  const hourMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)/);
  const minuteMatch = normalized.match(/(\d+)\s*(m|min|mins|minute|minutes)/);
  const plainNumberMatch = normalized.match(/^(\d+)$/);

  let minutes = 0;
  if (hourMatch) minutes += Number(hourMatch[1]) * 60;
  if (minuteMatch) minutes += Number(minuteMatch[1]);
  if (!minutes && plainNumberMatch) minutes = Number(plainNumberMatch[1]);

  return minutes > 0 ? Math.round(minutes) : DEFAULT_SLOT_MINUTES;
};

const generateTimeSlots = (duration?: string) => {
  const slotMinutes = durationToMinutes(duration);

  return WORK_PERIODS.flatMap(({ start, end }) => {
    const slots: string[] = [];
    const periodStart = timeToMinutes(start);
    const periodEnd = timeToMinutes(end);

    for (
      let current = periodStart;
      current + slotMinutes <= periodEnd;
      current += slotMinutes
    ) {
      slots.push(
        `${minutesToTime(current)}-${minutesToTime(current + slotMinutes)}`,
      );
    }

    return slots;
  });
};

const CleaningSlotsPage: React.FC = () => {
  const qc = useQueryClient();
  const [bulkModal, setBulkModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [serviceFilter, setServiceFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [bulkData, setBulkData] = useState({
    serviceId: "",
    startDate: "",
    endDate: "",
    timeSlots: generateTimeSlots(),
    maxBookings: 1,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["cleaning-services"],
    queryFn: () => cleaningApi.getAll().then((r) => r.data.data),
  });

  const { data: slots, isLoading } = useQuery({
    queryKey: ["cleaning-slots", serviceFilter, dateFilter],
    queryFn: () =>
      cleaningSlotApi
        .getAll({
          serviceId: serviceFilter || undefined,
          date: dateFilter || undefined,
        })
        .then((r) => r.data.data),
  });

  const bulkMutation = useMutation({
    mutationFn: () => cleaningSlotApi.createBulk(bulkData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cleaning-slots"] });
      setBulkModal(false);
    },
  });

  const toggleAvailability = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      cleaningSlotApi.update(id, { isAvailable }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cleaning-slots"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cleaningSlotApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cleaning-slots"] });
      setDeleteId(null);
    },
  });

  const getServiceById = (serviceId: string) =>
    services.find((service: CleaningService) => service._id === serviceId);

  const selectedBulkService = getServiceById(bulkData.serviceId);
  const generatedBulkTimeSlots = generateTimeSlots(
    selectedBulkService?.duration,
  );

  const setBulkService = (serviceId: string) => {
    const selectedService = getServiceById(serviceId);
    setBulkData((p) => ({
      ...p,
      serviceId,
      timeSlots: generateTimeSlots(selectedService?.duration),
    }));
  };

  const toggleTimeSlot = (ts: string) => {
    setBulkData((p) => ({
      ...p,
      timeSlots: p.timeSlots.includes(ts)
        ? p.timeSlots.filter((t) => t !== ts)
        : [...p.timeSlots, ts],
    }));
  };

  const serviceName = (serviceId: CleaningSlot["serviceId"]) => {
    if (typeof serviceId === "object") return serviceId.name;
    return services.find((s: CleaningService) => s._id === serviceId)?.name || "-";
  };

  const columns = [
    {
      key: "serviceId",
      label: "Service",
      render: (v: unknown) => serviceName(v as CleaningSlot["serviceId"]),
    },
    { key: "date", label: "Date" },
    { key: "timeSlot", label: "Time Slot" },
    {
      key: "currentBookings",
      label: "Bookings",
      render: (v: unknown, row: unknown) =>
        `${v} / ${(row as CleaningSlot).maxBookings}`,
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
        const slot = row as CleaningSlot;
        return (
          <div className="flex gap-2">
            <button
              onClick={() =>
                toggleAvailability.mutate({
                  id: slot._id,
                  isAvailable: !slot.isAvailable,
                })
              }
              className={`text-xs px-2 py-1 rounded-lg font-medium ${
                slot.isAvailable
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {slot.isAvailable ? "Disable" : "Enable"}
            </button>
            <button
              onClick={() => setDeleteId(slot._id)}
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
        <h1 className="text-2xl font-bold text-gray-900">Cleaning Slots</h1>
        <button
          onClick={() => {
            const selectedServiceId = serviceFilter || services[0]?._id || "";
            const selectedService = getServiceById(selectedServiceId);
            setBulkData((p) => ({
              ...p,
              serviceId: selectedServiceId,
              timeSlots: generateTimeSlots(selectedService?.duration),
            }));
            setBulkModal(true);
          }}
          className="btn-primary"
        >
          + Create Slots
        </button>
      </div>

      <div className="flex gap-3 items-end">
        <div>
          <label className="label">Service</label>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="input min-w-56"
          >
            <option value="">All Services</option>
            {services.map((service: CleaningService) => (
              <option key={service._id} value={service._id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input"
          />
        </div>
        {(serviceFilter || dateFilter) && (
          <button
            onClick={() => {
              setServiceFilter("");
              setDateFilter("");
            }}
            className="btn-secondary"
          >
            Clear
          </button>
        )}
        <div className="ml-auto text-sm text-gray-500">
          {slots?.length || 0} slots
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <Table
          columns={columns as Parameters<typeof Table>[0]["columns"]}
          data={slots || []}
          loading={isLoading}
        />
      </div>

      <Modal
        isOpen={bulkModal}
        onClose={() => setBulkModal(false)}
        title="Create Cleaning Slots"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Cleaning Service</label>
            <select
              value={bulkData.serviceId}
              onChange={(e) => setBulkService(e.target.value)}
              className="input"
            >
              <option value="">Select service</option>
              {services.map((service: CleaningService) => (
                <option key={service._id} value={service._id}>
                  {service.name} {service.duration ? `(${service.duration})` : ""}
                </option>
              ))}
            </select>
          </div>
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
            <label className="label">
              Time Slots
              {bulkData.serviceId ? (
                <span className="ml-2 font-normal text-gray-500">
                  {durationToMinutes(selectedBulkService?.duration)} mins each
                </span>
              ) : null}
            </label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {generatedBulkTimeSlots.map((ts) => (
                <label
                  key={ts}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm ${
                    bulkData.timeSlots.includes(ts)
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200"
                  }`}
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
            {bulkData.serviceId && generatedBulkTimeSlots.length === 0 ? (
              <p className="text-sm text-gray-500 mt-2">
                No slots fit this duration within 08:00-13:00 or 14:00-18:00.
              </p>
            ) : null}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => bulkMutation.mutate()}
              disabled={
                bulkMutation.isPending ||
                !bulkData.serviceId ||
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

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirm Delete"
        size="sm"
      >
        <p className="text-gray-600 mb-6">Delete this cleaning slot?</p>
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

export default CleaningSlotsPage;
