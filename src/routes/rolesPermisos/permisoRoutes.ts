import { Router } from "express";
import {
  getPermisos,
  getPermisoById,
  createPermiso,
  updatePermiso,
  deletePermiso,
  setPermisosDeRol,
} from "../../controllers/rolesPermisos/permisoController";

const router = Router();

router.get("/", getPermisos);
router.put("/rol/:id", setPermisosDeRol);
router.get("/:id", getPermisoById);
router.post("/", createPermiso);
router.put("/:id", updatePermiso);
router.delete("/:id", deletePermiso);

export default router;