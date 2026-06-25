import { Request, Response } from "express";
import prisma from "../../config/prisma";

// GET /api/perfiles
export const getPerfiles = async (req: Request, res: Response) => {
  try {
    const perfiles = await prisma.tbl_perfil.findMany();
    res.json(perfiles);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener perfiles" });
  }
};

// GET /api/perfiles/:id
export const getPerfilById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const perfil = await prisma.tbl_perfil.findUnique({
      where: { perfil_id: Number(id) },
    });
    if (!perfil) {
      res.status(404).json({ error: "Perfil no encontrado" });
      return;
    }
    res.json(perfil);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
};

// POST /api/perfiles
export const createPerfil = async (req: Request, res: Response) => {
  try {
    const { usuario_id, rol_id, perfil_estado } = req.body;
    const perfil = await prisma.tbl_perfil.create({
      data: { usuario_id, rol_id, perfil_estado },
    });
    res.status(201).json(perfil);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el perfil" });
  }
};

// PUT /api/perfiles/:id
export const updatePerfil = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { usuario_id, rol_id, perfil_estado } = req.body;
    const perfil = await prisma.tbl_perfil.update({
      where: { perfil_id: Number(id) },
      data: { usuario_id, rol_id, perfil_estado },
    });
    res.json(perfil);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el perfil" });
  }
};

// DELETE /api/perfiles/:id (borrado lógico)
export const deletePerfil = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const perfil = await prisma.tbl_perfil.update({
      where: { perfil_id: Number(id) },
      data: { perfil_estado: "I" },
    });
    res.json({ message: "Perfil desactivado correctamente", perfil });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el perfil" });
  }
};