import { Router } from "express";
import {
  getFacturas,
  getFacturaById,
  createFactura,
  anularFactura,
  getResumenVentas,
} from "../../controllers/ventas/facturaController";

const router = Router();

router.get("/resumen", getResumenVentas);
router.get("/", getFacturas);
router.get("/:id", getFacturaById);
router.post("/", createFactura);
router.patch("/:id/anular", anularFactura);

export default router;
