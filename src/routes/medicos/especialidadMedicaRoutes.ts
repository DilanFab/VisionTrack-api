import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
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
router.post("/", verifyToken, authorize("Admin"), createEspecialidadMedica);
router.put("/:id", verifyToken, authorize("Admin"), updateEspecialidadMedica);
router.delete("/:id", verifyToken, authorize("Admin"), deleteEspecialidadMedica);

export default router;