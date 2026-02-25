import ModificationItem from "../models/ModificationItem";
import { AppError } from "../utils/AppError";
import {
  CreateModItemInput,
  UpdateModItemInput,
} from "../validators/modItem.validator";

interface ModItemQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  isAvailable?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export const getModItems = async (query: ModItemQuery) => {
  const { page = 1, limit = 10, search, category, brand, isAvailable } = query;
  const filter: Record<string, unknown> = {};

  if (search) {
    filter.$text = { $search: search };
  }
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (typeof isAvailable === "boolean") filter.isAvailable = isAvailable;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    ModificationItem.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    ModificationItem.countDocuments(filter),
  ]);

  return { items, total, page, limit };
};

export const getModItemById = async (id: string) => {
  const item = await ModificationItem.findById(id);
  if (!item) throw new AppError("Modification item not found", 404);
  return item;
};

export const createModItem = async (data: CreateModItemInput) => {
  return ModificationItem.create(data);
};

export const updateModItem = async (id: string, data: UpdateModItemInput) => {
  const item = await ModificationItem.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!item) throw new AppError("Modification item not found", 404);
  return item;
};

export const deleteModItem = async (id: string) => {
  const item = await ModificationItem.findByIdAndDelete(id);
  if (!item) throw new AppError("Modification item not found", 404);
  return item;
};

export const updateStock = async (id: string, stockQty: number) => {
  const item = await ModificationItem.findByIdAndUpdate(
    id,
    { stockQty, isAvailable: stockQty > 0 },
    { new: true, runValidators: true },
  );
  if (!item) throw new AppError("Modification item not found", 404);
  return item;
};

export const getCategories = async () => {
  return ModificationItem.distinct("category");
};

export const getBrands = async () => {
  return ModificationItem.distinct("brand");
};
