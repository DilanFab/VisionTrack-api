import { Request, Response } from "express";
import * as notificacionesService from "../services/notificacionesService";

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
    console.error("Error al registrar push token:", error);
    res.status(500).json({ error: "Error al registrar el token push" });
  }
};

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
    console.error("Error al eliminar push token:", error);
    res.status(500).json({ error: "Error al eliminar el token push" });
  }
};
