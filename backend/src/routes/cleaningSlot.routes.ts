import { Router } from "express";
import * as cleaningSlotController from "../controllers/cleaningSlot.controller";
import { validate } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import {
  createBulkCleaningSlotsSchema,
  createCleaningSlotSchema,
} from "../validators/cleaningSlot.validator";

const router = Router();

router.get("/available", authenticate, cleaningSlotController.getAvailableSlots);
router.get("/", authenticate, requireAdmin, cleaningSlotController.getAllSlots);

router.post(
  "/",
  authenticate,
  requireAdmin,
  validate(createCleaningSlotSchema),
  cleaningSlotController.createSlot,
);

router.post(
  "/bulk",
  authenticate,
  requireAdmin,
  validate(createBulkCleaningSlotsSchema),
  cleaningSlotController.createBulkSlots,
);

router.put(
  "/:id",
  authenticate,
  requireAdmin,
  cleaningSlotController.updateSlot,
);
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  cleaningSlotController.deleteSlot,
);

export default router;
