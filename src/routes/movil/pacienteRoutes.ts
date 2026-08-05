import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getDisponibilidad,
  getDoctores,
  getHorariosPorDoctor,
  getOcupadosPorDoctor,
  getMisCitas,
  agendarCita,
  confirmarCita,
  cancelarCita,
} from "../../controllers/movil/pacienteController";

const router = Router();

// Disponibilidad — público (sin auth para explorar slots)
router.get("/disponibilidad", getDisponibilidad);

// Endpoints que requieren autenticación de paciente
router.use(verifyToken, authorize("Paciente"));

router.get("/doctores", getDoctores);
router.get("/horarios-doctor/:doctorId", getHorariosPorDoctor);
router.get("/ocupados/:doctorId", getOcupadosPorDoctor);
router.get("/mis-citas", getMisCitas);
router.post("/agendar", agendarCita);
router.patch("/mis-citas/:id/confirmar", confirmarCita);
router.patch("/mis-citas/:id/cancelar", cancelarCita);
router.delete("/mis-citas/:id", cancelarCita);

export default router;
