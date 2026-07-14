import { Router } from "express";
import { registrarPushToken, eliminarPushToken } from "../controllers/notificacionesController";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.post("/push-token", verifyToken, registrarPushToken);
router.delete("/push-token", verifyToken, eliminarPushToken);

export default router;
