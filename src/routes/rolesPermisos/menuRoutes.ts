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

router.get("/", verifyToken, authorize("Admin"), getMenus);
router.get("/:id", verifyToken, authorize("Admin"), getMenuById);
router.post("/", verifyToken, authorize("Admin"), createMenu);
router.put("/:id", verifyToken, authorize("Admin"), updateMenu);
router.delete("/:id", verifyToken, authorize("Admin"), deleteMenu);

export default router;