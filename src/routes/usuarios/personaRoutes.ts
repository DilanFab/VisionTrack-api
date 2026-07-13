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

router.get("/", verifyToken, authorize("Admin"), getPersonas);
router.get("/:id", verifyToken, authorize("Admin"), getPersonaById);
router.post("/", verifyToken, authorize("Admin"), createPersona);
router.put("/:id", verifyToken, authorize("Admin"), updatePersona);
router.delete("/:id", verifyToken, authorize("Admin"), deletePersona);

export default router;