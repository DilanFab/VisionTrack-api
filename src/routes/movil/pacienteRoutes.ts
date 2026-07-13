import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getDisponibilidad,
  getMisCitas,
  agendarCita,
  cancelarCita,
} from "../../controllers/movil/pacienteController";

const router = Router();

// Disponibilidad — público (sin auth para explorar slots)
router.get("/disponibilidad", getDisponibilidad);

// Endpoints que requieren autenticación de paciente
router.use(verifyToken, authorize("Paciente"));

router.get("/mis-citas", getMisCitas);
router.post("/agendar", agendarCita);
router.delete("/mis-citas/:id", cancelarCita);

export default router;
