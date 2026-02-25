import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";

const router = Router();

/**
 * @openapi
 * /dashboard/metrics:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard metrics (ADMIN)
 */
router.get(
  "/metrics",
  authenticate,
  requireAdmin,
  dashboardController.getMetrics,
);

export default router;
