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
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of cleaning services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Cleaning services fetched
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                       duration:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 */
router.get("/", cleaningController.getAll);

/**
 * @openapi
 * /cleaning-services/{id}:
 *   get:
 *     tags: [Cleaning Services]
 *     summary: Get cleaning service by ID (public)
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cleaning service details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     duration:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *       404:
 *         description: Not found
 */
router.get("/:id", cleaningController.getById);

/**
 * @openapi
 * /cleaning-services:
 *   post:
 *     tags: [Cleaning Services]
 *     summary: Create cleaning service (ADMIN)
 *     responses:
 *       201:
 *         description: Created successfully
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
