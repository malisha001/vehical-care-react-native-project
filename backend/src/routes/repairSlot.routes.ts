import { Router } from "express";
import * as repairSlotController from "../controllers/repairSlot.controller";
import { validate } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import {
  createRepairSlotSchema,
  createBulkSlotsSchema,
} from "../validators/repairSlot.validator";

const router = Router();

// Public / User: get available slots
router.get("/available", authenticate, repairSlotController.getAvailableSlots);

// Admin: get all slots (including unavailable)
router.get("/", authenticate, requireAdmin, repairSlotController.getAllSlots);

// Admin: create single slot
router.post(
  "/",
  authenticate,
  requireAdmin,
  validate(createRepairSlotSchema),
  repairSlotController.createSlot,
);

// Admin: create bulk slots
router.post(
  "/bulk",
  authenticate,
  requireAdmin,
  validate(createBulkSlotsSchema),
  repairSlotController.createBulkSlots,
);

// Admin: update slot
router.put("/:id", authenticate, requireAdmin, repairSlotController.updateSlot);

// Admin: delete slot
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  repairSlotController.deleteSlot,
);

export default router;
