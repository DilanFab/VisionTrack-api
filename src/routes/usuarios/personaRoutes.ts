import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getPersonas,
  getPersonaById,
  createPersona,
  updatePersona,
  deletePersona,
} from "../../controllers/usuarios/personaController";

const router = Router();

router.get("/", verifyToken, authorize("Administrador"), getPersonas);
router.get("/:id", verifyToken, authorize("Administrador"), getPersonaById);
router.post("/", verifyToken, authorize("Administrador"), createPersona);
router.put("/:id", verifyToken, authorize("Administrador"), updatePersona);
router.delete("/:id", verifyToken, authorize("Administrador"), deletePersona);

export default router;