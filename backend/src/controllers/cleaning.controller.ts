import { Request, Response, NextFunction } from "express";
import * as cleaningService from "../services/cleaning.service";
import { sendSuccess } from "../utils/apiResponse";

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const isActive =
      req.query.isActive !== undefined
        ? req.query.isActive === "true"
        : undefined;
    const services = await cleaningService.getAllCleaningServices(isActive);
    sendSuccess(res, "Cleaning services fetched", services);
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
    const service = await cleaningService.getCleaningServiceById(req.params.id);
    sendSuccess(res, "Cleaning service fetched", service);
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
    const service = await cleaningService.createCleaningService(req.body);
    sendSuccess(res, "Cleaning service created", service, 201);
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
    const service = await cleaningService.updateCleaningService(
      req.params.id,
      req.body,
    );
    sendSuccess(res, "Cleaning service updated", service);
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
    await cleaningService.deleteCleaningService(req.params.id);
    sendSuccess(res, "Cleaning service deleted");
  } catch (err) {
    next(err);
  }
};
