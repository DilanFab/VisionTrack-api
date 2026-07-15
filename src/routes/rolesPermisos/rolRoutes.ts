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

router.get("/", verifyToken, authorize("Administrador"), getRoles);
router.get("/:id", verifyToken, authorize("Administrador"), getRolById);
router.post("/", verifyToken, authorize("Administrador"), createRol);
router.put("/:id", verifyToken, authorize("Administrador"), updateRol);
router.delete("/:id", verifyToken, authorize("Administrador"), deleteRol);

export default router;