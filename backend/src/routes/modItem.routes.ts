import { Router } from "express";
import * as modItemController from "../controllers/modItem.controller";
import { validate } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import {
  createModItemSchema,
  updateModItemSchema,
  updateStockSchema,
} from "../validators/modItem.validator";

const router = Router();

/**
 * @openapi
 * /mod-items:
 *   get:
 *     tags: [Modification Items]
 *     summary: Get all modification items (public, with search + filter)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: brand
 *         schema: { type: string }
 *       - in: query
 *         name: isAvailable
 *         schema: { type: boolean }
 */
router.get("/", modItemController.getAll);
router.get("/meta/categories", modItemController.getCategories);
router.get("/meta/brands", modItemController.getBrands);
router.get("/:id", modItemController.getById);

router.post(
  "/",
  authenticate,
  requireAdmin,
  validate(createModItemSchema),
  modItemController.create,
);
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  validate(updateModItemSchema),
  modItemController.update,
);
router.delete("/:id", authenticate, requireAdmin, modItemController.remove);

/**
 * @openapi
 * /mod-items/{id}/stock:
 *   patch:
 *     tags: [Modification Items]
 *     summary: Update stock quantity (ADMIN)
 */
router.patch(
  "/:id/stock",
  authenticate,
  requireAdmin,
  validate(updateStockSchema),
  modItemController.updateStock,
);

export default router;
