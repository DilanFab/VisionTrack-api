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

router.get("/", verifyToken, authorize("Admin", "Medico"), getHistoriasClinicas);
router.get("/:id", verifyToken, authorize("Admin", "Medico"), getHistoriaClinicaById);
router.post("/", verifyToken, authorize("Admin", "Medico"), createHistoriaClinica);
router.put("/:id", verifyToken, authorize("Admin", "Medico"), updateHistoriaClinica);
router.delete("/:id", verifyToken, authorize("Admin", "Medico"), deleteHistoriaClinica);

export default router;