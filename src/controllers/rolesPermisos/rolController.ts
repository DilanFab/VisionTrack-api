import { Request, Response } from "express";
import prisma from "../../config/prisma";

// GET /api/roles
export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.tbl_rol.findMany();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener roles" });
  }
};

// GET /api/roles/:id
export const getRolById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rol = await prisma.tbl_rol.findUnique({
      where: { rol_id: Number(id) },
    });
    if (!rol) {
      res.status(404).json({ error: "Rol no encontrado" });
      return;
    }
    res.json(rol);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el rol" });
  }
};

// POST /api/roles
export const createRol = async (req: Request, res: Response) => {
  try {
    const { rol_nombre, rol_descripcion, rol_estado } = req.body;
    const rol = await prisma.tbl_rol.create({
      data: { rol_nombre, rol_descripcion, rol_estado },
    });
    res.status(201).json(rol);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el rol" });
  }
};

// PUT /api/roles/:id
export const updateRol = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rol_nombre, rol_descripcion, rol_estado } = req.body;
    const rol = await prisma.tbl_rol.update({
      where: { rol_id: Number(id) },
      data: { rol_nombre, rol_descripcion, rol_estado },
    });
    res.json(rol);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el rol" });
  }
};

// DELETE /api/roles/:id (borrado lógico)
export const deleteRol = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rol = await prisma.tbl_rol.update({
      where: { rol_id: Number(id) },
      data: { rol_estado: "I" },
    });
    res.json({ message: "Rol desactivado correctamente", rol });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el rol" });
  }
};