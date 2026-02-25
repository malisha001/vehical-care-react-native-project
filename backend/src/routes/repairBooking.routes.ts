import { Router } from "express";
import * as repairBookingController from "../controllers/repairBooking.controller";
import { validate } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin, requireUser } from "../middlewares/role.middleware";
import {
  createRepairBookingSchema,
  updateBookingStatusSchema,
} from "../validators/repairBooking.validator";

const router = Router();

// User: create booking
router.post(
  "/",
  authenticate,
  requireUser,
  validate(createRepairBookingSchema),
  repairBookingController.createBooking,
);

// User: get my bookings
router.get(
  "/my",
  authenticate,
  requireUser,
  repairBookingController.getMyBookings,
);

// Admin: get all bookings
router.get(
  "/",
  authenticate,
  requireAdmin,
  repairBookingController.getAllBookings,
);

// Any authenticated: get single booking (user only sees their own)
router.get("/:id", authenticate, repairBookingController.getBookingById);

// Admin: update booking status
router.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  validate(updateBookingStatusSchema),
  repairBookingController.updateBookingStatus,
);

export default router;
