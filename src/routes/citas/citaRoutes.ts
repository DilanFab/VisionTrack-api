import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getCitas,
  getCitaById,
  createCita,
  updateCita,
  deleteCita,
} from "../../controllers/citas/citaController";

const router = Router();

router.get("/", verifyToken, authorize("Administrador", "Medico"), getCitas);
router.get("/:id", verifyToken, authorize("Administrador", "Medico"), getCitaById);
router.post("/", verifyToken, authorize("Administrador", "Medico"), createCita);
router.put("/:id", verifyToken, authorize("Administrador", "Medico"), updateCita);
router.delete("/:id", verifyToken, authorize("Administrador", "Medico"), deleteCita);

export default router;