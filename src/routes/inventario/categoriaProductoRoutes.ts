import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getCategoriasProducto,
  createCategoriaProducto,
  updateCategoriaProducto,
  deleteCategoriaProducto,
} from "../../controllers/inventario/categoriaProductoController";

const router = Router();

router.use(verifyToken, authorize("Administrador", "Recepcionista"));

router.get("/", getCategoriasProducto);
router.post("/", createCategoriaProducto);
router.put("/:id", updateCategoriaProducto);
router.delete("/:id", deleteCategoriaProducto);

export default router;
