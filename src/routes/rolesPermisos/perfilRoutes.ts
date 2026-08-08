import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getPerfiles,
  getPerfilById,
  createPerfil,
  updatePerfil,
  deletePerfil,
} from "../../controllers/rolesPermisos/perfilController";

const router = Router();

router.get("/", verifyToken, authorize("Administrador"), getPerfiles);
router.get("/:id", verifyToken, authorize("Administrador"), getPerfilById);
router.post("/", verifyToken, authorize("Administrador"), createPerfil);
router.put("/:id", verifyToken, authorize("Administrador"), updatePerfil);
router.delete("/:id", verifyToken, authorize("Administrador"), deletePerfil);

export default router;