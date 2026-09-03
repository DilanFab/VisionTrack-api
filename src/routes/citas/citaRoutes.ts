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

router.get("/", verifyToken, authorize("Administrador", "Medico", "Recepcionista"), getCitas);
router.get("/:id", verifyToken, authorize("Administrador", "Medico", "Recepcionista"), getCitaById);
router.post("/", verifyToken, authorize("Administrador", "Medico", "Recepcionista"), createCita);
router.put("/:id", verifyToken, authorize("Administrador", "Medico", "Recepcionista"), updateCita);
router.delete("/:id", verifyToken, authorize("Administrador", "Medico", "Recepcionista"), deleteCita);

export default router;