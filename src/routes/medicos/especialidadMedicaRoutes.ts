import { Router } from "express";
import {
  getEspecialidadesMedicas,
  getEspecialidadMedicaById,
  createEspecialidadMedica,
  updateEspecialidadMedica,
  deleteEspecialidadMedica,
} from "../../controllers/medicos/especialidadMedicaController";

const router = Router();

router.get("/", getEspecialidadesMedicas);
router.get("/:id", getEspecialidadMedicaById);
router.post("/", createEspecialidadMedica);
router.put("/:id", updateEspecialidadMedica);
router.delete("/:id", deleteEspecialidadMedica);

export default router;