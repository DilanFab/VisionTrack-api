import { Router } from "express";
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

router.get("/", getHorariosDoctor);
router.get("/doctor/:doctorId", getHorariosPorDoctor);
router.put("/doctor/:doctorId", setHorariosPorDoctor);
router.get("/:id", getHorarioDoctorById);
router.post("/", createHorarioDoctor);
router.put("/:id", updateHorarioDoctor);
router.delete("/:id", deleteHorarioDoctor);

export default router;