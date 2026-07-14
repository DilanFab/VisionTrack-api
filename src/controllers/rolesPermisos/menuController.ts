import { Request, Response } from "express";
import * as menuService from "../../services/menuService";

export const getMenus = async (_req: Request, res: Response) => {
  try {
    const menus = await menuService.listar();
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener menús" });
  }
};

export const getMenuById = async (req: Request, res: Response) => {
  try {
    const menu = await menuService.obtenerPorId(Number(req.params.id));
    if (!menu) { res.status(404).json({ error: "Menú no encontrado" }); return; }
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el menú" });
  }
};

export const createMenu = async (req: Request, res: Response) => {
  try {
    const menu = await menuService.crear(req.body);
    res.status(201).json(menu);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el menú" });
  }
};

export const updateMenu = async (req: Request, res: Response) => {
  try {
    const menu = await menuService.actualizar(Number(req.params.id), req.body);
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el menú" });
  }
};

export const deleteMenu = async (req: Request, res: Response) => {
  try {
    const menu = await menuService.eliminar(Number(req.params.id));
    res.json({ message: "Menú desactivado correctamente", menu });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el menú" });
  }
};
