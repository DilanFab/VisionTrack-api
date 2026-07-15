import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getDoctores,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../../controllers/medicos/doctorController";

const router = Router();

router.get("/", verifyToken, authorize("Administrador", "Medico"), getDoctores);
router.get("/:id", verifyToken, authorize("Administrador", "Medico"), getDoctorById);
router.post("/", verifyToken, authorize("Administrador", "Medico"), createDoctor);
router.put("/:id", verifyToken, authorize("Administrador", "Medico"), updateDoctor);
router.delete("/:id", verifyToken, authorize("Administrador", "Medico"), deleteDoctor);

export default router;