import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getHorariosDoctor,
  getHorariosPorDoctor,
  setHorariosPorDoctor,
  getHorarioDoctorById,
  createHorarioDoctor,
  updateHorarioDoctor,
  deleteHorarioDoctor,
} from "../../controllers/medicos/horarioDoctorController";

const router = Router();

router.get("/", verifyToken, authorize("Administrador", "Medico"), getHorariosDoctor);
router.get("/doctor/:doctorId", verifyToken, authorize("Administrador", "Medico"), getHorariosPorDoctor);
router.put("/doctor/:doctorId", verifyToken, authorize("Administrador", "Medico"), setHorariosPorDoctor);
router.get("/:id", verifyToken, authorize("Administrador", "Medico"), getHorarioDoctorById);
router.post("/", verifyToken, authorize("Administrador", "Medico"), createHorarioDoctor);
router.put("/:id", verifyToken, authorize("Administrador", "Medico"), updateHorarioDoctor);
router.delete("/:id", verifyToken, authorize("Administrador", "Medico"), deleteHorarioDoctor);

export default router;