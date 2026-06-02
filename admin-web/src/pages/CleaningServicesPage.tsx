import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cleaningApi } from "../api/endpoints";
import { CleaningService } from "../types";
import Modal from "../components/ui/Modal";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";

const schema = z.object({
  name: z.string().min(2, "Min 2 chars"),
  description: z.string().min(5, "Min 5 chars"),
  price: z.number().min(0).optional().or(z.literal("")),
  duration: z.string().optional(),
  isActive: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

const CleaningServicesPage: React.FC = () => {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CleaningService | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: services, isLoading } = useQuery({
    queryKey: ["cleaning-services"],
    queryFn: () => cleaningApi.getAll().then((r) => r.data.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<CleaningService>) => cleaningApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cleaning-services"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CleaningService>;
    }) => cleaningApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cleaning-services"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cleaningApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cleaning-services"] });
      setDeleteId(null);
    },
  });

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", description: "", isActive: true });
    setModalOpen(true);
  };
  const openEdit = (s: CleaningService) => {
    setEditing(s);
    reset({
      name: s.name,
      description: s.description,
      price: s.price,
      duration: s.duration,
      isActive: s.isActive,
    });
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    reset();
  };

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      price: data.price === "" ? undefined : Number(data.price),
    };
    if (editing) updateMutation.mutate({ id: editing._id, data: payload });
    else createMutation.mutate(payload);
  };

  const columns = [
    { key: "name", label: "Name" },
    {
      key: "description",
      label: "Description",
      render: (v: unknown) => (
        <span className="line-clamp-1 max-w-xs">{v as string}</span>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (v: unknown) => (v ? `LKR ${v}` : "-"),
    },
    {
      key: "duration",
      label: "Duration",
      render: (v: unknown) => (v as string) || "-",
    },
    {
      key: "isActive",
      label: "Status",
      render: (v: unknown) => (
        <Badge label={v ? "Active" : "Inactive"} color={v ? "green" : "red"} />
      ),
    },
    {
      key: "_id",
      label: "Actions",
      render: (_: unknown, row: unknown) => {
        const s = row as CleaningService;
        return (
          <div className="flex gap-2">
            <button
              onClick={() => openEdit(s)}
              className="btn-secondary text-xs px-3 py-1"
            >
              Edit
            </button>
            <button
              onClick={() => setDeleteId(s._id)}
              className="btn-danger text-xs px-3 py-1"
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
        <h1 className="text-2xl font-bold text-gray-900">Cleaning Services</h1>
        <button onClick={openCreate} className="btn-primary">
          + Add Service
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <Table
          columns={columns as Parameters<typeof Table>[0]["columns"]}
          data={(services || []) as Record<string, unknown>[]}
          loading={isLoading}
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit Cleaning Service" : "Add Cleaning Service"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              {...register("name")}
              className="input"
              placeholder="e.g. Body Wash"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              {...register("description")}
              rows={3}
              className="input"
              placeholder="Service description..."
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Price (LKR)</label>
              <input
                {...register("price", { valueAsNumber: true })}
                type="number"
                min="0"
                className="input"
                placeholder="500"
              />
            </div>
            <div>
              <label className="label">Duration</label>
              <input
                {...register("duration")}
                className="input"
                placeholder="e.g. 45 mins"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              {...register("isActive")}
              type="checkbox"
              id="isActive"
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1"
            >
              {isSubmitting ? "Saving..." : editing ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirm Delete"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this cleaning service?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => deleteMutation.mutate(deleteId!)}
            className="btn-danger flex-1"
            disabled={deleteMutation.isPending}
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

export default CleaningServicesPage;
