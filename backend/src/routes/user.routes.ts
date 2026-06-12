import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createAdminSchema } from "../validators/user.validator";

const router = Router();

router.get("/", authenticate, requireAdmin, userController.getAllUsers);
router.post(
	"/admin",
	authenticate,
	requireAdmin,
	validate(createAdminSchema),
	userController.createAdmin,
);
router.get("/:id", authenticate, requireAdmin, userController.getUserById);

export default router;
