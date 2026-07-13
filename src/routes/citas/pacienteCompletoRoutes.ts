import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getPacientesCompletos,
  createPacienteCompleto,
  updatePacienteCompleto,
  deletePacienteCompleto,
} from "../../controllers/citas/pacienteCompletoController";

const router = Router();

router.get("/", verifyToken, authorize("Admin"), getPacientesCompletos);
router.post("/", verifyToken, authorize("Admin"), createPacienteCompleto);
router.put("/:id", verifyToken, authorize("Admin"), updatePacienteCompleto);
router.delete("/:id", verifyToken, authorize("Admin"), deletePacienteCompleto);

export default router;
