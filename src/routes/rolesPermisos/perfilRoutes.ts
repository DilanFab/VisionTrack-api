import { Router } from "express";
import {
  getPerfiles,
  getPerfilById,
  createPerfil,
  updatePerfil,
  deletePerfil,
} from "../../controllers/rolesPermisos/perfilController";

const router = Router();

router.get("/", getPerfiles);
router.get("/:id", getPerfilById);
router.post("/", createPerfil);
router.put("/:id", updatePerfil);
router.delete("/:id", deletePerfil);

export default router;