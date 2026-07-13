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

router.get("/", verifyToken, authorize("Admin", "Medico"), getHorariosDoctor);
router.get("/doctor/:doctorId", verifyToken, authorize("Admin", "Medico"), getHorariosPorDoctor);
router.put("/doctor/:doctorId", verifyToken, authorize("Admin", "Medico"), setHorariosPorDoctor);
router.get("/:id", verifyToken, authorize("Admin", "Medico"), getHorarioDoctorById);
router.post("/", verifyToken, authorize("Admin", "Medico"), createHorarioDoctor);
router.put("/:id", verifyToken, authorize("Admin", "Medico"), updateHorarioDoctor);
router.delete("/:id", verifyToken, authorize("Admin", "Medico"), deleteHorarioDoctor);

export default router;