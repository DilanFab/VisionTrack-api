import { Router } from "express";
import {
  getCitas,
  getCitaById,
  createCita,
  updateCita,
  deleteCita,
  getMisCitas,
  confirmarCita,
  cancelarCita,
  crearMiCita,
  getOcupadosPorDoctor,
} from "../../controllers/citas/citaController";
import { verificarToken } from "../../middlewares/auth";

const router = Router();

// Debe ir antes de "/:id" para que Express no la interprete como un id.
router.get("/mis-citas", verificarToken, getMisCitas);
router.post("/mis-citas", verificarToken, crearMiCita);
router.get("/ocupados/:doctorId", verificarToken, getOcupadosPorDoctor);

router.get("/", getCitas);
router.get("/:id", getCitaById);
router.post("/", createCita);
router.put("/:id", updateCita);
router.patch("/:id/confirmar", verificarToken, confirmarCita);
router.patch("/:id/cancelar", verificarToken, cancelarCita);
router.delete("/:id", deleteCita);

export default router;
