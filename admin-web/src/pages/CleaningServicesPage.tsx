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
          <button
            onClick={() => openEdit(s)}
            className="btn-secondary text-xs px-3 py-1"
          >
            Edit Duration
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Cleaning Services</h1>
        <p className="text-sm text-gray-500">
          Fixed cleaning categories. Update duration, price, and availability here.
        </p>
      </div>

      <div className="card p-0 overflow-hidden">
        <Table
          columns={columns as Parameters<typeof Table>[0]["columns"]}
          data={services || []}
          loading={isLoading}
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title="Edit Cleaning Service"
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
              {isSubmitting ? "Saving..." : "Update"}
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
    </div>
  );
};

export default CleaningServicesPage;
