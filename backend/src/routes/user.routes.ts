import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";

const router = Router();

router.get("/", authenticate, requireAdmin, userController.getAllUsers);
router.get("/:id", authenticate, requireAdmin, userController.getUserById);

export default router;
