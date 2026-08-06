import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getHistoriasClinicas,
  getHistoriaClinicaById,
  createHistoriaClinica,
  updateHistoriaClinica,
  deleteHistoriaClinica,
} from "../../controllers/citas/historiaClinicaController";

const router = Router();

router.get("/", verifyToken, authorize("Administrador", "Medico"), getHistoriasClinicas);
router.get("/:id", verifyToken, authorize("Administrador", "Medico"), getHistoriaClinicaById);
router.post("/", verifyToken, authorize("Administrador", "Medico"), createHistoriaClinica);
router.put("/:id", verifyToken, authorize("Administrador", "Medico"), updateHistoriaClinica);
router.delete("/:id", verifyToken, authorize("Administrador", "Medico"), deleteHistoriaClinica);

export default router;