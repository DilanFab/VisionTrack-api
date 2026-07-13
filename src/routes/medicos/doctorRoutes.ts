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

router.get("/", verifyToken, authorize("Admin", "Medico"), getDoctores);
router.get("/:id", verifyToken, authorize("Admin", "Medico"), getDoctorById);
router.post("/", verifyToken, authorize("Admin", "Medico"), createDoctor);
router.put("/:id", verifyToken, authorize("Admin", "Medico"), updateDoctor);
router.delete("/:id", verifyToken, authorize("Admin", "Medico"), deleteDoctor);

export default router;