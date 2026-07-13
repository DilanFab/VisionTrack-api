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

router.get("/", verifyToken, authorize("Admin", "Medico"), getCitas);
router.get("/:id", verifyToken, authorize("Admin", "Medico"), getCitaById);
router.post("/", verifyToken, authorize("Admin", "Medico"), createCita);
router.put("/:id", verifyToken, authorize("Admin", "Medico"), updateCita);
router.delete("/:id", verifyToken, authorize("Admin", "Medico"), deleteCita);

export default router;