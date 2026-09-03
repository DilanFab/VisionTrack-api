import { Router } from "express";
import {
  getCategoriasProducto,
  createCategoriaProducto,
  updateCategoriaProducto,
  deleteCategoriaProducto,
} from "../../controllers/inventario/categoriaProductoController";

const router = Router();

router.get("/", getCategoriasProducto);
router.post("/", createCategoriaProducto);
router.put("/:id", updateCategoriaProducto);
router.delete("/:id", deleteCategoriaProducto);

export default router;
