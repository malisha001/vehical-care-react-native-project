import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { carrierRequestApi } from "../api/endpoints";
import { CarrierRequest, CarrierStatus } from "../types";
import Modal from "../components/ui/Modal";
import Table from "../components/ui/Table";
import { statusBadge } from "../components/ui/Badge";
import { format } from "date-fns";

const STATUSES: CarrierStatus[] = [
  "REQUESTED",
  "ASSIGNED",
  "COMPLETED",
  "CANCELLED",
];

const CarrierRequestsPage: React.FC = () => {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [updateModal, setUpdateModal] = useState<{
    request: CarrierRequest;
    status: CarrierStatus;
    driver: string;
  } | null>(null);

  const { data: res, isLoading } = useQuery({
    queryKey: ["carrier-requests", page, statusFilter],
    queryFn: () =>
      carrierRequestApi
        .getAll({ page, limit: 20, status: statusFilter || undefined })
        .then((r) => r.data),
  });

  const requests = (res?.data as CarrierRequest[]) || [];
  const meta = res?.meta;

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { status: string; assignedDriver?: string };
    }) => carrierRequestApi.updateStatus(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["carrier-requests"] });
      setUpdateModal(null);
    },
  });

  const getMapsUrl = (lat: number, lng: number) =>
    `https://www.google.com/maps?q=${lat},${lng}`;

  const columns = [
    {
      key: "createdAt",
      label: "Date",
      render: (v: unknown) =>
        format(new Date(v as string), "MMM dd, yyyy HH:mm"),
    },
    { key: "name", label: "Customer" },
    { key: "mobile", label: "Mobile" },
    {
      key: "address",
      label: "Location",
      render: (v: unknown, row: unknown) => {
        const r = row as CarrierRequest;
        return (
          <div>
            <p className="line-clamp-1 max-w-xs text-sm">{v as string}</p>
            <a
              href={getMapsUrl(r.coordinates.lat, r.coordinates.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-600 hover:underline"
            >
              📍 View on Map
            </a>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (v: unknown) => statusBadge(v as string),
    },
    {
      key: "assignedDriver",
      label: "Driver",
      render: (v: unknown) => (v as string) || "-",
    },
    {
      key: "_id",
      label: "Actions",
      render: (_: unknown, row: unknown) => {
        const r = row as CarrierRequest;
        return (
          <button
            onClick={() =>
              setUpdateModal({
                request: r,
                status: r.status,
                driver: r.assignedDriver || "",
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
      <h1 className="text-2xl font-bold text-gray-900">Carrier Requests</h1>

      <div className="flex gap-3 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="input max-w-xs"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {statusFilter && (
          <button
            onClick={() => {
              setStatusFilter("");
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
          data={requests as Record<string, unknown>[]}
          loading={isLoading}
        />
      </div>

      {/* Pagination */}
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

      {/* Update Modal */}
      <Modal
        isOpen={!!updateModal}
        onClose={() => setUpdateModal(null)}
        title="Update Carrier Request"
      >
        {updateModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <p>
                <strong>Customer:</strong> {updateModal.request.name}
              </p>
              <p>
                <strong>Mobile:</strong> {updateModal.request.mobile}
              </p>
              <p>
                <strong>Location:</strong> {updateModal.request.address}
              </p>
              {updateModal.request.notes && (
                <p>
                  <strong>Notes:</strong> {updateModal.request.notes}
                </p>
              )}
              <a
                href={getMapsUrl(
                  updateModal.request.coordinates.lat,
                  updateModal.request.coordinates.lng,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline text-xs"
              >
                📍 Open in Google Maps
              </a>
            </div>
            <div>
              <label className="label">Status</label>
              <select
                value={updateModal.status}
                onChange={(e) =>
                  setUpdateModal((p) =>
                    p
                      ? { ...p, status: e.target.value as CarrierStatus }
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
              <label className="label">Assigned Driver (optional)</label>
              <input
                value={updateModal.driver}
                onChange={(e) =>
                  setUpdateModal((p) =>
                    p ? { ...p, driver: e.target.value } : null,
                  )
                }
                className="input"
                placeholder="Driver name or ID"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  updateMutation.mutate({
                    id: updateModal.request._id,
                    data: {
                      status: updateModal.status,
                      assignedDriver: updateModal.driver || undefined,
                    },
                  })
                }
                disabled={updateMutation.isPending}
                className="btn-primary flex-1"
              >
                {updateMutation.isPending ? "Updating..." : "Update"}
              </button>
              <button
                onClick={() => setUpdateModal(null)}
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

const getMapsUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps?q=${lat},${lng}`;

export default CarrierRequestsPage;
