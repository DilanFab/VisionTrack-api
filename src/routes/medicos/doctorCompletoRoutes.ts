import { Router } from "express";
import {
  getDoctoresCompletos,
  createDoctorCompleto,
  updateDoctorCompleto,
  deleteDoctorCompleto,
} from "../../controllers/medicos/doctorCompletoController";

const router = Router();

router.get("/", getDoctoresCompletos);
router.post("/", createDoctorCompleto);
router.put("/:id", updateDoctorCompleto);
router.delete("/:id", deleteDoctorCompleto);

export default router;
