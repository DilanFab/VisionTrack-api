import { Request, Response } from "express";
import * as menuService from "../../services/menuService";

/**
 * @openapi
 * /api/menus:
 *   get:
 *     tags: [Menus]
 *     summary: Listar menús
 *     responses:
 *       200:
 *         description: Lista de menús
 */
export const getMenus = async (_req: Request, res: Response) => {
  try {
    const menus = await menuService.listar();
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener menús" });
  }
};

/**
 * @openapi
 * /api/menus/{id}:
 *   get:
 *     tags: [Menus]
 *     summary: Obtener menú por ID
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Menú encontrado
 *       404:
 *         description: Menú no encontrado
 */
export const getMenuById = async (req: Request, res: Response) => {
  try {
    const menu = await menuService.obtenerPorId(Number(req.params.id));
    if (!menu) { res.status(404).json({ error: "Menú no encontrado" }); return; }
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el menú" });
  }
};

/**
 * @openapi
 * /api/menus:
 *   post:
 *     tags: [Menus]
 *     summary: Crear menú
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [menu_nombre, menu_referencia]
 *             properties:
 *               menu_nombre: { type: string, example: "Dashboard" }
 *               menu_icono: { type: string, example: "home" }
 *               menu_referencia: { type: string, example: "/dashboard" }
 *               menu_padre: { type: integer, example: null }
 *     responses:
 *       201:
 *         description: Menú creado
 */
export const createMenu = async (req: Request, res: Response) => {
  try {
    const menu = await menuService.crear(req.body);
    res.status(201).json(menu);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el menú" });
  }
};

/**
 * @openapi
 * /api/menus/{id}:
 *   put:
 *     tags: [Menus]
 *     summary: Actualizar menú
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               menu_nombre: { type: string, example: "Dashboard" }
 *     responses:
 *       200:
 *         description: Menú actualizado
 */
export const updateMenu = async (req: Request, res: Response) => {
  try {
    const menu = await menuService.actualizar(Number(req.params.id), req.body);
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el menú" });
  }
};

/**
 * @openapi
 * /api/menus/{id}:
 *   delete:
 *     tags: [Menus]
 *     summary: Desactivar menú
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Menú desactivado
 */
export const deleteMenu = async (req: Request, res: Response) => {
  try {
    const menu = await menuService.eliminar(Number(req.params.id));
    res.json({ message: "Menú desactivado correctamente", menu });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el menú" });
  }
};
