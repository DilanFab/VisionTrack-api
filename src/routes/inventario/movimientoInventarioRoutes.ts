import { Router } from "express";
import {
  getMovimientosInventario,
  createMovimientoInventario,
} from "../../controllers/inventario/movimientoInventarioController";

const router = Router();

router.get("/", getMovimientosInventario);
router.post("/", createMovimientoInventario);

export default router;
