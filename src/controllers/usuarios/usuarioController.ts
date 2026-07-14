import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../config/prisma";
import { getPagination, paginatedResponse } from "../../utils/pagination";
import { buildEstadoFilter } from "../../utils/filters";

// GET /api/usuarios
export const getUsuarios = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPagination(req.query as { page?: string; limit?: string });
    const { usuario_estado } = req.query as Record<string, string>;

    const where: Record<string, unknown> = {};
    const estadoFilter = buildEstadoFilter(usuario_estado);
    if (estadoFilter) where.usuario_estado = estadoFilter;

    const select = {
      usuario_id: true,
      persona_id: true,
      usuario_imagen: true,
      usuario_nombre: true,
      usuario_intentos: true,
      usuario_cambiar_contrasena: true,
      usuario_estado: true,
    };

    const [usuarios, total] = await Promise.all([
      prisma.tbl_usuario.findMany({ where, select, skip, take: limit }),
      prisma.tbl_usuario.count({ where }),
    ]);

    res.json(paginatedResponse(usuarios, total, page, limit));
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

// GET /api/usuarios/:id
export const getUsuarioById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuario = await prisma.tbl_usuario.findUnique({
      where: { usuario_id: Number(id) },
      select: {
        usuario_id: true,
        persona_id: true,
        usuario_imagen: true,
        usuario_nombre: true,
        usuario_intentos: true,
        usuario_cambiar_contrasena: true,
        usuario_estado: true,
      },
    });
    if (!usuario) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el usuario" });
  }
};

// POST /api/usuarios
export const createUsuario = async (req: Request, res: Response) => {
  try {
    const {
      persona_id,
      usuario_imagen,
      usuario_nombre,
      usuario_contrasena,
      usuario_estado,
    } = req.body;

    const hashedPassword = await bcrypt.hash(usuario_contrasena, 10);

    const usuario = await prisma.tbl_usuario.create({
      data: {
        persona_id,
        usuario_imagen,
        usuario_nombre,
        usuario_contrasena: hashedPassword,
        usuario_estado,
      },
      select: {
        usuario_id: true,
        persona_id: true,
        usuario_imagen: true,
        usuario_nombre: true,
        usuario_intentos: true,
        usuario_cambiar_contrasena: true,
        usuario_estado: true,
      },
    });
    res.status(201).json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el usuario" });
  }
};

// PUT /api/usuarios/:id
export const updateUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      persona_id,
      usuario_imagen,
      usuario_nombre,
      usuario_contrasena,
      usuario_intentos,
      usuario_cambiar_contrasena,
      usuario_estado,
    } = req.body;

    const data: any = {
      persona_id,
      usuario_imagen,
      usuario_nombre,
      usuario_intentos,
      usuario_cambiar_contrasena,
      usuario_estado,
    };

    // Solo re-encripta si se envía una nueva contraseña
    if (usuario_contrasena) {
      data.usuario_contrasena = await bcrypt.hash(usuario_contrasena, 10);
    }

    const usuario = await prisma.tbl_usuario.update({
      where: { usuario_id: Number(id) },
      data,
      select: {
        usuario_id: true,
        persona_id: true,
        usuario_imagen: true,
        usuario_nombre: true,
        usuario_intentos: true,
        usuario_cambiar_contrasena: true,
        usuario_estado: true,
      },
    });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el usuario" });
  }
};

// DELETE /api/usuarios/:id (borrado lógico)
export const deleteUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuario = await prisma.tbl_usuario.update({
      where: { usuario_id: Number(id) },
      data: { usuario_estado: "I" },
      select: {
        usuario_id: true,
        usuario_nombre: true,
        usuario_estado: true,
      },
    });
    res.json({ message: "Usuario desactivado correctamente", usuario });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el usuario" });
  }
};