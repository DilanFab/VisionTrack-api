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

router.get("/", verifyToken, authorize("Admin"), getPerfiles);
router.get("/:id", verifyToken, authorize("Admin"), getPerfilById);
router.post("/", verifyToken, authorize("Admin"), createPerfil);
router.put("/:id", verifyToken, authorize("Admin"), updatePerfil);
router.delete("/:id", verifyToken, authorize("Admin"), deletePerfil);

export default router;