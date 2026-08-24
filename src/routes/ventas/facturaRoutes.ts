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

// Roles de lectura (ver facturas y resumen): Administrador y Recepcionista
const guardLectura = [verifyToken, authorize("Administrador", "Recepcionista")];

// Roles de escritura (emitir y anular facturas): Solo Recepcionista
const guardEscritura = [verifyToken, authorize("Recepcionista")];

router.get("/resumen", ...guardLectura, getResumenVentas);
router.get("/", ...guardLectura, getFacturas);
router.get("/:id", ...guardLectura, getFacturaById);
router.post("/", ...guardEscritura, createFactura);
router.patch("/:id/anular", ...guardEscritura, anularFactura);

export default router;
