import { Router } from "express";
import { verifyToken, authorize } from "../../middlewares/auth";
import {
  getMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
} from "../../controllers/rolesPermisos/menuController";

const router = Router();

router.get("/", verifyToken, authorize("Administrador"), getMenus);
router.get("/:id", verifyToken, authorize("Administrador"), getMenuById);
router.post("/", verifyToken, authorize("Administrador"), createMenu);
router.put("/:id", verifyToken, authorize("Administrador"), updateMenu);
router.delete("/:id", verifyToken, authorize("Administrador"), deleteMenu);

export default router;