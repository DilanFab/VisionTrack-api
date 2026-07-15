import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getEstadosCita,
  getEstadoCitaById,
  createEstadoCita,
  updateEstadoCita,
  deleteEstadoCita,
} from "../../controllers/citas/estadoCitaController";

const router = Router();

router.get("/", getEstadosCita);
router.get("/:id", getEstadoCitaById);
router.post("/", verifyToken, authorize("Administrador"), createEstadoCita);
router.put("/:id", verifyToken, authorize("Administrador"), updateEstadoCita);
router.delete("/:id", verifyToken, authorize("Administrador"), deleteEstadoCita);

export default router;