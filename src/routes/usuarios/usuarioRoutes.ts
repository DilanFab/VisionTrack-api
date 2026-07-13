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

router.get("/", verifyToken, authorize("Admin"), getUsuarios);
router.get("/:id", verifyToken, authorize("Admin"), getUsuarioById);
router.post("/", verifyToken, authorize("Admin"), createUsuario);
router.put("/:id", verifyToken, authorize("Admin"), updateUsuario);
router.delete("/:id", verifyToken, authorize("Admin"), deleteUsuario);

export default router;