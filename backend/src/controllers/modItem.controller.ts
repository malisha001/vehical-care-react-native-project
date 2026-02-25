import { Request, Response, NextFunction } from "express";
import * as modItemService from "../services/modItem.service";
import { sendSuccess } from "../utils/apiResponse";

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const brand = req.query.brand as string | undefined;
    const isAvailable =
      req.query.isAvailable !== undefined
        ? req.query.isAvailable === "true"
        : undefined;

    const result = await modItemService.getModItems({
      page,
      limit,
      search,
      category,
      brand,
      isAvailable,
    });
    sendSuccess(res, "Modification items fetched", result.items, 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  } catch (err) {
    next(err);
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const item = await modItemService.getModItemById(req.params.id);
    sendSuccess(res, "Modification item fetched", item);
  } catch (err) {
    next(err);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const item = await modItemService.createModItem(req.body);
    sendSuccess(res, "Modification item created", item, 201);
  } catch (err) {
    next(err);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const item = await modItemService.updateModItem(req.params.id, req.body);
    sendSuccess(res, "Modification item updated", item);
  } catch (err) {
    next(err);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await modItemService.deleteModItem(req.params.id);
    sendSuccess(res, "Modification item deleted");
  } catch (err) {
    next(err);
  }
};

export const updateStock = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const item = await modItemService.updateStock(
      req.params.id,
      req.body.stockQty,
    );
    sendSuccess(res, "Stock updated", item);
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await modItemService.getCategories();
    sendSuccess(res, "Categories fetched", categories);
  } catch (err) {
    next(err);
  }
};

export const getBrands = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const brands = await modItemService.getBrands();
    sendSuccess(res, "Brands fetched", brands);
  } catch (err) {
    next(err);
  }
};
