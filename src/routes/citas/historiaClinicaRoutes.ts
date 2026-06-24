import { Router } from "express";
import {
  getHistoriasClinicas,
  getHistoriaClinicaById,
  createHistoriaClinica,
  updateHistoriaClinica,
  deleteHistoriaClinica,
} from "../../controllers/citas/historiaClinicaController";

const router = Router();

router.get("/", getHistoriasClinicas);
router.get("/:id", getHistoriaClinicaById);
router.post("/", createHistoriaClinica);
router.put("/:id", updateHistoriaClinica);
router.delete("/:id", deleteHistoriaClinica);

export default router;