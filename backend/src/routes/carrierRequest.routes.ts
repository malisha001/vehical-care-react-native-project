import { Router } from "express";
import * as carrierController from "../controllers/carrierRequest.controller";
import { validate } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin, requireUser } from "../middlewares/role.middleware";
import {
  createCarrierRequestSchema,
  updateCarrierStatusSchema,
} from "../validators/carrierRequest.validator";

const router = Router();

// User: create a carrier request
router.post(
  "/",
  authenticate,
  requireUser,
  validate(createCarrierRequestSchema),
  carrierController.createRequest,
);

// User: get my carrier requests
router.get("/my", authenticate, requireUser, carrierController.getMyRequests);

// Admin: get all carrier requests
router.get("/", authenticate, requireAdmin, carrierController.getAllRequests);

// Any authenticated: get single request
router.get("/:id", authenticate, carrierController.getRequestById);

// Admin: update carrier request status
router.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  validate(updateCarrierStatusSchema),
  carrierController.updateStatus,
);

export default router;
