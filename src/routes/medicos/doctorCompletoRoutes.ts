import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getDoctoresCompletos,
  createDoctorCompleto,
  updateDoctorCompleto,
  deleteDoctorCompleto,
} from "../../controllers/medicos/doctorCompletoController";

const router = Router();

router.get("/", verifyToken, authorize("Administrador"), getDoctoresCompletos);
router.post("/", verifyToken, authorize("Administrador"), createDoctorCompleto);
router.put("/:id", verifyToken, authorize("Administrador"), updateDoctorCompleto);
router.delete("/:id", verifyToken, authorize("Administrador"), deleteDoctorCompleto);

export default router;
