import { Request, Response } from "express";
import prisma from "../config/prisma";

// POST /api/notificaciones/push-token
export const registrarPushToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const usuario_id = req.usuario!.usuario_id;

    if (!token || typeof token !== "string") {
      res.status(400).json({ error: "El campo token es requerido" });
      return;
    }

    // Upsert: crear o actualizar si ya existe
    const existing = await prisma.tbl_push_token.findFirst({
      where: { usuario_id, token },
    });

    if (existing) {
      res.json({ message: "Token push ya registrado", push_token_id: existing.push_token_id });
      return;
    }

    const pushToken = await prisma.tbl_push_token.create({
      data: { usuario_id, token },
    });

    res.status(201).json({ message: "Token push registrado", push_token_id: pushToken.push_token_id });
  } catch (error) {
    console.error("Error al registrar push token:", error);
    res.status(500).json({ error: "Error al registrar el token push" });
  }
};

// DELETE /api/notificaciones/push-token
export const eliminarPushToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const usuario_id = req.usuario!.usuario_id;

    if (!token || typeof token !== "string") {
      res.status(400).json({ error: "El campo token es requerido" });
      return;
    }

    await prisma.tbl_push_token.deleteMany({
      where: { usuario_id, token },
    });

    res.json({ message: "Token push eliminado" });
  } catch (error) {
    console.error("Error al eliminar push token:", error);
    res.status(500).json({ error: "Error al eliminar el token push" });
  }
};
