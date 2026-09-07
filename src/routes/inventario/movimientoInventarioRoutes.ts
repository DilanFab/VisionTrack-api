import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getMovimientosInventario,
  createMovimientoInventario,
} from "../../controllers/inventario/movimientoInventarioController";

const router = Router();

router.use(verifyToken, authorize("Administrador", "Recepcionista"));

router.get("/", getMovimientosInventario);
router.post("/", createMovimientoInventario);

export default router;
