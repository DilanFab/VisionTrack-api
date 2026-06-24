import { Router } from "express";
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
router.post("/", createEstadoCita);
router.put("/:id", updateEstadoCita);
router.delete("/:id", deleteEstadoCita);

export default router;