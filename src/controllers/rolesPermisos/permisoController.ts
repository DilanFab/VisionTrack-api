import { Request, Response } from "express";
import prisma from "../../config/prisma";

// GET /api/permisos
export const getPermisos = async (req: Request, res: Response) => {
  try {
    const permisos = await prisma.tbl_permiso.findMany();
    res.json(permisos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener permisos" });
  }
};

// GET /api/permisos/:id
export const getPermisoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const permiso = await prisma.tbl_permiso.findUnique({
      where: { permiso_id: Number(id) },
    });
    if (!permiso) {
      res.status(404).json({ error: "Permiso no encontrado" });
      return;
    }
    res.json(permiso);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el permiso" });
  }
};

// POST /api/permisos
export const createPermiso = async (req: Request, res: Response) => {
  try {
    const { rol_id, menu_id, permiso_estado } = req.body;
    const permiso = await prisma.tbl_permiso.create({
      data: { rol_id, menu_id, permiso_estado },
    });
    res.status(201).json(permiso);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el permiso" });
  }
};

// PUT /api/permisos/:id
export const updatePermiso = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rol_id, menu_id, permiso_estado } = req.body;
    const permiso = await prisma.tbl_permiso.update({
      where: { permiso_id: Number(id) },
      data: { rol_id, menu_id, permiso_estado },
    });
    res.json(permiso);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el permiso" });
  }
};

// DELETE /api/permisos/:id (borrado lógico)
export const deletePermiso = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const permiso = await prisma.tbl_permiso.update({
      where: { permiso_id: Number(id) },
      data: { permiso_estado: "I" },
    });
    res.json({ message: "Permiso desactivado correctamente", permiso });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el permiso" });
  }
};

// PUT /api/permisos/rol/:id
// Reemplaza por completo los permisos de un rol: borra físicamente los
// existentes y crea uno nuevo por cada menu_id recibido, evitando duplicados.
export const setPermisosDeRol = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { menu_ids } = req.body;
    const rol_id = Number(id);

    const permisos = await prisma.$transaction(async (tx) => {
      await tx.tbl_permiso.deleteMany({ where: { rol_id } });

      if (Array.isArray(menu_ids) && menu_ids.length > 0) {
        await tx.tbl_permiso.createMany({
          data: menu_ids.map((menu_id: number) => ({ rol_id, menu_id })),
        });
      }

      return tx.tbl_permiso.findMany({ where: { rol_id } });
    });

    res.json(permisos);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar los permisos del rol" });
  }
};