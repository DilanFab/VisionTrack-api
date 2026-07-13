import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getRoles,
  getRolById,
  createRol,
  updateRol,
  deleteRol,
} from "../../controllers/rolesPermisos/rolController";

const router = Router();

router.get("/", verifyToken, authorize("Admin"), getRoles);
router.get("/:id", verifyToken, authorize("Admin"), getRolById);
router.post("/", verifyToken, authorize("Admin"), createRol);
router.put("/:id", verifyToken, authorize("Admin"), updateRol);
router.delete("/:id", verifyToken, authorize("Admin"), deleteRol);

export default router;