import { Router } from "express";
import * as cleaningController from "../controllers/cleaning.controller";
import { validate } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import {
  createCleaningServiceSchema,
  updateCleaningServiceSchema,
} from "../validators/cleaning.validator";

const router = Router();

/**
 * @openapi
 * /cleaning-services:
 *   get:
 *     tags: [Cleaning Services]
 *     summary: Get all cleaning services (public)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 */
router.get("/", cleaningController.getAll);

/**
 * @openapi
 * /cleaning-services/{id}:
 *   get:
 *     tags: [Cleaning Services]
 *     summary: Get cleaning service by ID (public)
 *     security: []
 */
router.get("/:id", cleaningController.getById);

/**
 * @openapi
 * /cleaning-services:
 *   post:
 *     tags: [Cleaning Services]
 *     summary: Create cleaning service (ADMIN)
 */
router.post(
  "/",
  authenticate,
  requireAdmin,
  validate(createCleaningServiceSchema),
  cleaningController.create,
);

/**
 * @openapi
 * /cleaning-services/{id}:
 *   put:
 *     tags: [Cleaning Services]
 *     summary: Update cleaning service (ADMIN)
 */
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  validate(updateCleaningServiceSchema),
  cleaningController.update,
);

/**
 * @openapi
 * /cleaning-services/{id}:
 *   delete:
 *     tags: [Cleaning Services]
 *     summary: Delete cleaning service (ADMIN)
 */
router.delete("/:id", authenticate, requireAdmin, cleaningController.remove);

export default router;
