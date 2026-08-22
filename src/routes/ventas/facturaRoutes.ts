import { Router } from "express";
import {
  getFacturas,
  getFacturaById,
  createFactura,
  anularFactura,
  getResumenVentas,
} from "../../controllers/ventas/facturaController";
import { verifyToken, authorize } from "../../middlewares/auth";

const router = Router();

// Todos los endpoints de facturación requieren autenticación
// Roles permitidos: Administrador y Recepcionista
const guardFacturas = [verifyToken, authorize("Administrador", "Recepcionista")];

router.get("/resumen", ...guardFacturas, getResumenVentas);
router.get("/", ...guardFacturas, getFacturas);
router.get("/:id", ...guardFacturas, getFacturaById);
router.post("/", ...guardFacturas, createFactura);
router.patch("/:id/anular", ...guardFacturas, anularFactura);

export default router;
