import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getUsuariosCompletos,
  createUsuarioCompleto,
  updateUsuarioCompleto,
  deleteUsuarioCompleto,
} from "../../controllers/usuarios/usuarioCompletoController";

const router = Router();

router.get("/", verifyToken, authorize("Admin"), getUsuariosCompletos);
router.post("/", verifyToken, authorize("Admin"), createUsuarioCompleto);
router.put("/:id", verifyToken, authorize("Admin"), updateUsuarioCompleto);
router.delete("/:id", verifyToken, authorize("Admin"), deleteUsuarioCompleto);

export default router;
