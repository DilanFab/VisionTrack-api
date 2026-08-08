import { Router } from "express";
import {
  getProductos,
  getProductoById,
  getProductosStockBajo,
  createProducto,
  updateProducto,
  deleteProducto,
} from "../../controllers/inventario/productoController";

const router = Router();

router.get("/", getProductos);
router.get("/alertas-stock", getProductosStockBajo);
router.get("/:id", getProductoById);
router.post("/", createProducto);
router.put("/:id", updateProducto);
router.delete("/:id", deleteProducto);

export default router;
