import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import { listarCajas, obtenerCajaAbierta, abrirCaja, registrarMovimientoCaja, cerrarCaja } from "../../controllers/ventas/cajaController";

const router = Router();
router.use(verifyToken, authorize("Administrador", "Recepcionista"));
router.get("/", listarCajas);
router.get("/abierta", obtenerCajaAbierta);
router.post("/abrir", abrirCaja);
router.post("/movimientos", registrarMovimientoCaja);
router.post("/:id/cerrar", cerrarCaja);
export default router;
