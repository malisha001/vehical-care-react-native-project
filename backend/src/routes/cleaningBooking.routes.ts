import { Router } from "express";
import * as cleaningBookingController from "../controllers/cleaningBooking.controller";
import { validate } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin, requireUser } from "../middlewares/role.middleware";
import {
  createCleaningBookingSchema,
  updateCleaningBookingBillSchema,
  updateCleaningBookingStatusSchema,
} from "../validators/cleaningBooking.validator";

const router = Router();

router.post(
  "/",
  authenticate,
  requireUser,
  validate(createCleaningBookingSchema),
  cleaningBookingController.createBooking,
);

router.get(
  "/my",
  authenticate,
  requireUser,
  cleaningBookingController.getMyBookings,
);

router.get(
  "/",
  authenticate,
  requireAdmin,
  cleaningBookingController.getAllBookings,
);

router.get("/:id", authenticate, cleaningBookingController.getBookingById);

router.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  validate(updateCleaningBookingStatusSchema),
  cleaningBookingController.updateBookingStatus,
);

router.patch(
  "/:id/bill",
  authenticate,
  requireAdmin,
  validate(updateCleaningBookingBillSchema),
  cleaningBookingController.updateBookingBill,
);

export default router;
