import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from "../../controllers/usuarios/usuarioController";

const router = Router();

router.get("/", verifyToken, authorize("Administrador"), getUsuarios);
router.get("/:id", verifyToken, authorize("Administrador"), getUsuarioById);
router.post("/", verifyToken, authorize("Administrador"), createUsuario);
router.put("/:id", verifyToken, authorize("Administrador"), updateUsuario);
router.delete("/:id", verifyToken, authorize("Administrador"), deleteUsuario);

export default router;