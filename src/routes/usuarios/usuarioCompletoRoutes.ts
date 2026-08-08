import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getUsuariosCompletos,
  createUsuarioCompleto,
  updateUsuarioCompleto,
  deleteUsuarioCompleto,
} from "../../controllers/usuarios/usuarioCompletoController";

const router = Router();

router.get("/", verifyToken, authorize("Administrador"), getUsuariosCompletos);
router.post("/", verifyToken, authorize("Administrador"), createUsuarioCompleto);
router.put("/:id", verifyToken, authorize("Administrador"), updateUsuarioCompleto);
router.delete("/:id", verifyToken, authorize("Administrador"), deleteUsuarioCompleto);

export default router;
