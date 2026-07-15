import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getPermisos,
  getPermisoById,
  createPermiso,
  updatePermiso,
  deletePermiso,
  setPermisosDeRol,
} from "../../controllers/rolesPermisos/permisoController";

const router = Router();

router.get("/", verifyToken, authorize("Administrador"), getPermisos);
router.put("/rol/:id", verifyToken, authorize("Administrador"), setPermisosDeRol);
router.get("/:id", verifyToken, authorize("Administrador"), getPermisoById);
router.post("/", verifyToken, authorize("Administrador"), createPermiso);
router.put("/:id", verifyToken, authorize("Administrador"), updatePermiso);
router.delete("/:id", verifyToken, authorize("Administrador"), deletePermiso);

export default router;