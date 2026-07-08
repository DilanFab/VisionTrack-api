import { Router } from "express";
import {
  getUsuariosCompletos,
  createUsuarioCompleto,
  updateUsuarioCompleto,
  deleteUsuarioCompleto,
} from "../../controllers/usuarios/usuarioCompletoController";

const router = Router();

router.get("/", getUsuariosCompletos);
router.post("/", createUsuarioCompleto);
router.put("/:id", updateUsuarioCompleto);
router.delete("/:id", deleteUsuarioCompleto);

export default router;
