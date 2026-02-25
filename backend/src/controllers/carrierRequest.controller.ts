import { Response, NextFunction } from "express";
import * as carrierService from "../services/carrierRequest.service";
import { sendSuccess } from "../utils/apiResponse";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const request = await carrierService.createCarrierRequest(
      req.user!.userId,
      req.body,
    );
    sendSuccess(res, "Carrier request created", request, 201);
  } catch (err) {
    next(err);
  }
};

export const getMyRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await carrierService.getMyCarrierRequests(
      req.user!.userId,
      page,
      limit,
    );
    sendSuccess(res, "My carrier requests fetched", result.requests, 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string | undefined;
    const result = await carrierService.getAllCarrierRequests(
      page,
      limit,
      status,
    );
    sendSuccess(res, "All carrier requests fetched", result.requests, 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const request = await carrierService.updateCarrierStatus(
      req.params.id,
      req.body,
    );
    sendSuccess(res, "Carrier request status updated", request);
  } catch (err) {
    next(err);
  }
};

export const getRequestById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.role === "ADMIN" ? undefined : req.user!.userId;
    const request = await carrierService.getCarrierRequestById(
      req.params.id,
      userId,
    );
    sendSuccess(res, "Carrier request fetched", request);
  } catch (err) {
    next(err);
  }
};
