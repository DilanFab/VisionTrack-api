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

router.get("/", verifyToken, authorize("Admin"), getPermisos);
router.put("/rol/:id", verifyToken, authorize("Admin"), setPermisosDeRol);
router.get("/:id", verifyToken, authorize("Admin"), getPermisoById);
router.post("/", verifyToken, authorize("Admin"), createPermiso);
router.put("/:id", verifyToken, authorize("Admin"), updatePermiso);
router.delete("/:id", verifyToken, authorize("Admin"), deletePermiso);

export default router;