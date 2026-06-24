import { Router } from "express";
import {
  getDoctores,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../../controllers/medicos/doctorController";

const router = Router();

router.get("/", getDoctores);
router.get("/:id", getDoctorById);
router.post("/", createDoctor);
router.put("/:id", updateDoctor);
router.delete("/:id", deleteDoctor);

export default router;