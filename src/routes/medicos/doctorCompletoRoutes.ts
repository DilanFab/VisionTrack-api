import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getDoctoresCompletos,
  createDoctorCompleto,
  updateDoctorCompleto,
  deleteDoctorCompleto,
} from "../../controllers/medicos/doctorCompletoController";

const router = Router();

router.get("/", verifyToken, authorize("Admin"), getDoctoresCompletos);
router.post("/", verifyToken, authorize("Admin"), createDoctorCompleto);
router.put("/:id", verifyToken, authorize("Admin"), updateDoctorCompleto);
router.delete("/:id", verifyToken, authorize("Admin"), deleteDoctorCompleto);

export default router;
