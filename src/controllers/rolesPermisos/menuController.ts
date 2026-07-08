import { Request, Response } from "express";
import prisma from "../../config/prisma";

// GET /api/menus
export const getMenus = async (req: Request, res: Response) => {
  try {
    // orden explícito por menu_id: sin ORDER BY, Postgres no garantiza devolver
    // las filas en el orden de inserción (puede variar tras un UPDATE/VACUUM).
    const menus = await prisma.tbl_menu.findMany({ orderBy: { menu_id: "asc" } });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener menús" });
  }
};

// GET /api/menus/:id
export const getMenuById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const menu = await prisma.tbl_menu.findUnique({
      where: { menu_id: Number(id) },
      include: { hijos: true },
    });
    if (!menu) {
      res.status(404).json({ error: "Menú no encontrado" });
      return;
    }
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el menú" });
  }
};

// POST /api/menus
export const createMenu = async (req: Request, res: Response) => {
  try {
    const { menu_padre, menu_nombre, menu_icono, menu_referencia, menu_estado } = req.body;

    const menu = await prisma.tbl_menu.create({
      data: {
        menu_padre: menu_padre ?? null,
        menu_nombre,
        menu_icono,
        menu_referencia,
        menu_estado,
      },
    });
    res.status(201).json(menu);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el menú" });
  }
};

// PUT /api/menus/:id
export const updateMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { menu_padre, menu_nombre, menu_icono, menu_referencia, menu_estado } = req.body;

    const menu = await prisma.tbl_menu.update({
      where: { menu_id: Number(id) },
      data: {
        menu_padre,
        menu_nombre,
        menu_icono,
        menu_referencia,
        menu_estado,
      },
    });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el menú" });
  }
};

// DELETE /api/menus/:id (borrado lógico)
export const deleteMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const menu = await prisma.tbl_menu.update({
      where: { menu_id: Number(id) },
      data: { menu_estado: "I" },
    });
    res.json({ message: "Menú desactivado correctamente", menu });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el menú" });
  }
};