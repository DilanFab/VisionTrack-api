import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getExamenesOptometricos,
  getExamenOptometricoById,
  createExamenOptometrico,
  updateExamenOptometrico,
  finalizarExamenOptometrico,
  deleteExamenOptometrico,
} from "../../controllers/citas/examenOptometricoController";

const router = Router();

router.use(verifyToken, authorize("Administrador", "Medico", "Médico"));

router.get("/", getExamenesOptometricos);
router.post("/", createExamenOptometrico);
router.get("/:id", getExamenOptometricoById);
router.put("/:id", updateExamenOptometrico);
router.patch("/:id/finalizar", finalizarExamenOptometrico);
router.delete("/:id", deleteExamenOptometrico);

export default router;
