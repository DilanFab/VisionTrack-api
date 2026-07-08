import { Router } from "express";
import {
  getPacientesCompletos,
  createPacienteCompleto,
  updatePacienteCompleto,
  deletePacienteCompleto,
} from "../../controllers/citas/pacienteCompletoController";

const router = Router();

router.get("/", getPacientesCompletos);
router.post("/", createPacienteCompleto);
router.put("/:id", updatePacienteCompleto);
router.delete("/:id", deletePacienteCompleto);

export default router;
