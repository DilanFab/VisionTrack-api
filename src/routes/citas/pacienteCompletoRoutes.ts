import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getPacientesCompletos,
  createPacienteCompleto,
  updatePacienteCompleto,
  deletePacienteCompleto,
} from "../../controllers/citas/pacienteCompletoController";

const router = Router();

router.get("/", verifyToken, authorize("Administrador"), getPacientesCompletos);
router.post("/", verifyToken, authorize("Administrador"), createPacienteCompleto);
router.put("/:id", verifyToken, authorize("Administrador"), updatePacienteCompleto);
router.delete("/:id", verifyToken, authorize("Administrador"), deletePacienteCompleto);

export default router;
