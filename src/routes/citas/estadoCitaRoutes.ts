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
router.post("/", verifyToken, authorize("Admin"), createEstadoCita);
router.put("/:id", verifyToken, authorize("Admin"), updateEstadoCita);
router.delete("/:id", verifyToken, authorize("Admin"), deleteEstadoCita);

export default router;