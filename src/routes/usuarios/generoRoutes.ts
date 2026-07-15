import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getGeneros,
  getGeneroById,
  createGenero,
  updateGenero,
  deleteGenero,
} from "../../controllers/usuarios/generoController";

const router = Router();

router.get("/", getGeneros);
router.get("/:id", getGeneroById);
router.post("/", verifyToken, authorize("Administrador"), createGenero);
router.put("/:id", verifyToken, authorize("Administrador"), updateGenero);
router.delete("/:id", verifyToken, authorize("Administrador"), deleteGenero);

export default router;