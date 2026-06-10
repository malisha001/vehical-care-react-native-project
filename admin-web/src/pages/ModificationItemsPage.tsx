import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { modItemApi } from "../api/endpoints";
import { ModificationItem } from "../types";
import Modal from "../components/ui/Modal";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";

const schema = z.object({
  name: z.string().min(2),
  brand: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(5),
  stockQty: z.number().min(0),
  tags: z.string().optional(),
  images: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const DEFAULT_MOD_CATEGORIES = [
  "Exhaust",
  "Lighting",
  "Body Kit",
  "Suspension",
  "Engine",
  "Interior",
];

const ModificationItemsPage: React.FC = () => {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [stockModal, setStockModal] = useState<{
    id: string;
    qty: number;
  } | null>(null);
  const [editing, setEditing] = useState<ModificationItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [newStock, setNewStock] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["mod-items", search, categoryFilter],
    queryFn: () =>
      modItemApi
        .getAll({
          search: search || undefined,
          category: categoryFilter || undefined,
          limit: 50,
        })
        .then((r) => r.data.data),
  });

  const { data: categories } = useQuery({
    queryKey: ["mod-categories"],
    queryFn: () => modItemApi.getCategories().then((r) => r.data.data),
  });

  const categoryOptions = Array.from(
    new Set([...(categories || []), ...DEFAULT_MOD_CATEGORIES]),
  ).sort();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<ModificationItem>) => modItemApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mod-items"] });
      qc.invalidateQueries({ queryKey: ["mod-categories"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ModificationItem>;
    }) => modItemApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mod-items"] });
      qc.invalidateQueries({ queryKey: ["mod-categories"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => modItemApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mod-items"] });
      setDeleteId(null);
    },
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) =>
      modItemApi.updateStock(id, qty),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mod-items"] });
      setStockModal(null);
    },
  });

  const openCreate = () => {
    setEditing(null);
    reset({ stockQty: 0 });
    setModalOpen(true);
  };
  const openEdit = (item: ModificationItem) => {
    setEditing(item);
    reset({
      name: item.name,
      brand: item.brand,
      category: item.category,
      description: item.description,
      stockQty: item.stockQty,
      tags: item.tags.join(", "),
      images: item.images.join(", "),
    });
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    reset();
  };

  const onSubmit = (data: FormData) => {
    const payload: Partial<ModificationItem> = {
      ...data,
      tags: data.tags
        ? data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      images: data.images
        ? data.images
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean)
        : [],
    };
    if (editing) updateMutation.mutate({ id: editing._id, data: payload });
    else createMutation.mutate(payload);
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "brand", label: "Brand" },
    { key: "category", label: "Category" },
    { key: "stockQty", label: "Stock" },
    {
      key: "isAvailable",
      label: "Available",
      render: (v: unknown) => (
        <Badge label={v ? "Yes" : "No"} color={v ? "green" : "red"} />
      ),
    },
    {
      key: "_id",
      label: "Actions",
      render: (_: unknown, row: unknown) => {
        const item = row as ModificationItem;
        return (
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => openEdit(item)}
              className="btn-secondary text-xs px-2 py-1"
            >
              Edit
            </button>
            <button
              onClick={() => {
                setStockModal({ id: item._id, qty: item.stockQty });
                setNewStock(item.stockQty);
              }}
              className="btn bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs px-2 py-1"
            >
              Stock
            </button>
            <button
              onClick={() => setDeleteId(item._id)}
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
        <h1 className="text-2xl font-bold text-gray-900">Modification Items</h1>
        <button onClick={openCreate} className="btn-primary">
          + Add Item
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items..."
          className="input max-w-xs"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input max-w-xs"
        >
          <option value="">All Categories</option>
          {categories?.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        <Table
          columns={columns as Parameters<typeof Table>[0]["columns"]}
          data={data || []}
          loading={isLoading}
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit Item" : "Add Modification Item"}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <input {...register("name")} className="input" />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className="label">Brand</label>
              <input {...register("brand")} className="input" />
            </div>
            <div>
              <label className="label">Category</label>
              <select
                {...register("category")}
                className="input"
              >
                <option value="">Select category</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>
            <div>
              <label className="label">Stock Qty</label>
              <input
                {...register("stockQty", { valueAsNumber: true })}
                type="number"
                min="0"
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea {...register("description")} rows={3} className="input" />
          </div>
          <div>
            <label className="label">Tags (comma separated)</label>
            <input
              {...register("tags")}
              className="input"
              placeholder="sport, performance, exhaust"
            />
          </div>
          <div>
            <label className="label">Images (comma separated URLs)</label>
            <input
              {...register("images")}
              className="input"
              placeholder="https://..."
            />
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

      {/* Stock Update Modal */}
      <Modal
        isOpen={!!stockModal}
        onClose={() => setStockModal(null)}
        title="Update Stock"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="label">New Stock Quantity</label>
            <input
              type="number"
              min="0"
              value={newStock}
              onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
              className="input"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() =>
                stockMutation.mutate({ id: stockModal!.id, qty: newStock })
              }
              disabled={stockMutation.isPending}
              className="btn-primary flex-1"
            >
              {stockMutation.isPending ? "Updating..." : "Update Stock"}
            </button>
            <button
              onClick={() => setStockModal(null)}
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
        <p className="text-gray-600 mb-6">Delete this modification item?</p>
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

export default ModificationItemsPage;
