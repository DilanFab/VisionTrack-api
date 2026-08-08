import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getHistoriasClinicas,
  getHistoriaClinicaById,
  createHistoriaClinica,
  updateHistoriaClinica,
  deleteHistoriaClinica,
} from "../../controllers/citas/historiaClinicaController";
import { getExamenesPorHistoriaClinica } from "../../controllers/citas/examenOptometricoController";

const router = Router();

router.get("/", verifyToken, authorize("Administrador", "Medico"), getHistoriasClinicas);
router.get("/:id/examenes-optometricos", verifyToken, authorize("Administrador", "Medico", "Médico"), getExamenesPorHistoriaClinica);
router.get("/:id", verifyToken, authorize("Administrador", "Medico"), getHistoriaClinicaById);
router.post("/", verifyToken, authorize("Administrador", "Medico"), createHistoriaClinica);
router.put("/:id", verifyToken, authorize("Administrador", "Medico"), updateHistoriaClinica);
router.delete("/:id", verifyToken, authorize("Administrador", "Medico"), deleteHistoriaClinica);

export default router;