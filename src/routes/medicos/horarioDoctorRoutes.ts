import { Router } from "express";
import {
  getHorariosDoctor,
  getHorarioDoctorById,
  createHorarioDoctor,
  updateHorarioDoctor,
  deleteHorarioDoctor,
} from "../../controllers/medicos/horarioDoctorController";

const router = Router();

router.get("/", getHorariosDoctor);
router.get("/:id", getHorarioDoctorById);
router.post("/", createHorarioDoctor);
router.put("/:id", updateHorarioDoctor);
router.delete("/:id", deleteHorarioDoctor);

export default router;