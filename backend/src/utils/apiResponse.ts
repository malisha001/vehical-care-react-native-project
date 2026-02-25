import { Response } from "express";

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
}

export const sendSuccess = (
  res: Response,
  message: string,
  data: unknown = null,
  statusCode = 200,
  meta?: ApiMeta,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta && { meta }),
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown,
) => {
  const body: Record<string, unknown> = { success: false, message, data: null };
  if (errors !== undefined) body.errors = errors;
  return res.status(statusCode).json(body);
};
