import { Request, Response } from "express";
import * as notificacionesService from "../services/notificacionesService";
import { logger } from "../utils/logger";

/**
 * @openapi
 * /api/notificaciones/push-token:
 *   post:
 *     tags: [Notificaciones]
 *     summary: Registrar token de Expo Push para el usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string, example: "ExponentPushToken[xxxxxxxx]" }
 *     responses:
 *       201:
 *         description: Token push registrado
 *       200:
 *         description: Token ya registrado
 *       400:
 *         description: Token requerido
 */
export const registrarPushToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const usuario_id = req.usuario!.usuario_id;

    if (!token || typeof token !== "string") {
      res.status(400).json({ error: "El campo token es requerido" });
      return;
    }

    const result = await notificacionesService.registrarPushToken(usuario_id, token);

    if (result.duplicado) {
      res.json({ message: "Token push ya registrado", push_token_id: result.push_token_id });
      return;
    }

    res.status(201).json({ message: "Token push registrado", push_token_id: result.push_token_id });
  } catch (error) {
    logger.error({ err: error }, "Error al registrar push token");
    res.status(500).json({ error: "Error al registrar el token push" });
  }
};

/**
 * @openapi
 * /api/notificaciones/push-token:
 *   delete:
 *     tags: [Notificaciones]
 *     summary: Eliminar token de Expo Push del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string, example: "ExponentPushToken[xxxxxxxx]" }
 *     responses:
 *       200:
 *         description: Token push eliminado
 *       400:
 *         description: Token requerido
 */
export const eliminarPushToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const usuario_id = req.usuario!.usuario_id;

    if (!token || typeof token !== "string") {
      res.status(400).json({ error: "El campo token es requerido" });
      return;
    }

    await notificacionesService.eliminarPushToken(usuario_id, token);
    res.json({ message: "Token push eliminado" });
  } catch (error) {
    logger.error({ err: error }, "Error al eliminar push token");
    res.status(500).json({ error: "Error al eliminar el token push" });
  }
};
