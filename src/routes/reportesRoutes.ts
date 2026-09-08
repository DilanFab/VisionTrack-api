import { Router } from "express";
import { verifyToken, authorize } from "../middlewares/auth";
import {
  reporteVentas,
  reporteCompras,
  reporteInventario,
  reporteCitas,
  reporteCitasPorEstado,
  reporteAtencionesMedico,
} from "../controllers/reportesController";

const router = Router();

router.use(verifyToken, authorize("Administrador", "Recepcionista", "Medico"));

router.get("/ventas", reporteVentas);
router.get("/compras", reporteCompras);
router.get("/inventario", reporteInventario);
router.get("/citas", reporteCitas);
router.get("/citas-estado", reporteCitasPorEstado);
router.get("/atenciones-medico", reporteAtencionesMedico);

export default router;
