import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../config/prisma";

const usuarioCompletoSelect = {
  usuario_id: true,
  usuario_nombre: true,
  usuario_imagen: true,
  usuario_estado: true,
  persona: true,
  perfiles: {
    where: { perfil_estado: "A" as const },
    include: { rol: true },
  },
};

// GET /api/usuarios-completos
export const getUsuariosCompletos = async (req: Request, res: Response) => {
  try {
    const usuarios = await prisma.tbl_usuario.findMany({
      select: usuarioCompletoSelect,
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los usuarios" });
  }
};

// POST /api/usuarios-completos
export const createUsuarioCompleto = async (req: Request, res: Response) => {
  try {
    const {
      genero_id,
      persona_cedula,
      persona_primer_nombre,
      persona_segundo_nombre,
      persona_primer_apellido,
      persona_segundo_apellido,
      persona_fecha_nacimiento,
      persona_direccion,
      persona_telefono,
      persona_correo,
      usuario_nombre,
      usuario_contrasena,
      usuario_imagen,
      rol_ids,
    } = req.body;

    const cedulaExistente = await prisma.tbl_persona.findUnique({
      where: { persona_cedula },
    });
    if (cedulaExistente) {
      res.status(400).json({ error: "Ya existe una persona con esa cédula" });
      return;
    }

    const usuarioExistente = await prisma.tbl_usuario.findUnique({
      where: { usuario_nombre },
    });
    if (usuarioExistente) {
      res.status(400).json({ error: "Ese nombre de usuario ya está en uso" });
      return;
    }

    const hashedPassword = await bcrypt.hash(usuario_contrasena, 10);

    const usuarioId = await prisma.$transaction(async (tx) => {
      const persona = await tx.tbl_persona.create({
        data: {
          genero_id: Number(genero_id),
          persona_cedula,
          persona_primer_nombre,
          persona_segundo_nombre: persona_segundo_nombre || null,
          persona_primer_apellido,
          persona_segundo_apellido: persona_segundo_apellido || null,
          persona_fecha_nacimiento: new Date(persona_fecha_nacimiento),
          persona_direccion,
          persona_telefono,
          persona_correo,
          persona_estado: "A",
        },
      });

      const usuario = await tx.tbl_usuario.create({
        data: {
          persona_id: persona.persona_id,
          usuario_nombre,
          usuario_contrasena: hashedPassword,
          usuario_imagen: usuario_imagen || "default.png",
          usuario_estado: "A",
        },
      });

      if (Array.isArray(rol_ids) && rol_ids.length > 0) {
        await tx.tbl_perfil.createMany({
          data: rol_ids.map((rol_id: number) => ({
            usuario_id: usuario.usuario_id,
            rol_id,
            perfil_estado: "A",
          })),
        });
      }

      return usuario.usuario_id;
    });

    const usuarioCreado = await prisma.tbl_usuario.findUnique({
      where: { usuario_id: usuarioId },
      select: usuarioCompletoSelect,
    });
    res.status(201).json(usuarioCreado);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el usuario" });
  }
};

// PUT /api/usuarios-completos/:id  (id = usuario_id)
export const updateUsuarioCompleto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      genero_id,
      persona_cedula,
      persona_primer_nombre,
      persona_segundo_nombre,
      persona_primer_apellido,
      persona_segundo_apellido,
      persona_fecha_nacimiento,
      persona_direccion,
      persona_telefono,
      persona_correo,
      usuario_nombre,
      usuario_contrasena,
      usuario_imagen,
      usuario_estado,
      rol_ids,
    } = req.body;

    const usuarioActual = await prisma.tbl_usuario.findUnique({
      where: { usuario_id: Number(id) },
    });
    if (!usuarioActual) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.tbl_persona.update({
        where: { persona_id: usuarioActual.persona_id },
        data: {
          genero_id: Number(genero_id),
          persona_cedula,
          persona_primer_nombre,
          persona_segundo_nombre: persona_segundo_nombre || null,
          persona_primer_apellido,
          persona_segundo_apellido: persona_segundo_apellido || null,
          persona_fecha_nacimiento: new Date(persona_fecha_nacimiento),
          persona_direccion,
          persona_telefono,
          persona_correo,
        },
      });

      const usuarioData: Record<string, unknown> = {
        usuario_nombre,
        usuario_imagen,
        usuario_estado,
      };
      if (usuario_contrasena) {
        usuarioData.usuario_contrasena = await bcrypt.hash(usuario_contrasena, 10);
      }

      await tx.tbl_usuario.update({
        where: { usuario_id: Number(id) },
        data: usuarioData,
      });

      // Reemplaza por completo los perfiles del usuario (borrado físico +
      // recreación) para evitar duplicados, igual que setPermisosDeRol.
      await tx.tbl_perfil.deleteMany({ where: { usuario_id: Number(id) } });
      if (Array.isArray(rol_ids) && rol_ids.length > 0) {
        await tx.tbl_perfil.createMany({
          data: rol_ids.map((rol_id: number) => ({
            usuario_id: Number(id),
            rol_id,
            perfil_estado: "A",
          })),
        });
      }
    });

    const usuarioActualizado = await prisma.tbl_usuario.findUnique({
      where: { usuario_id: Number(id) },
      select: usuarioCompletoSelect,
    });
    res.json(usuarioActualizado);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el usuario" });
  }
};

// DELETE /api/usuarios-completos/:id (borrado lógico del usuario)
export const deleteUsuarioCompleto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuario = await prisma.tbl_usuario.update({
      where: { usuario_id: Number(id) },
      data: { usuario_estado: "I" },
    });
    res.json({ message: "Usuario desactivado correctamente", usuario });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el usuario" });
  }
};
