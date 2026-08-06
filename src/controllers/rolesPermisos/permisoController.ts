import { Request, Response } from "express";
import * as permisoService from "../../services/permisoService";

/**
 * @openapi
 * /api/permisos:
 *   get:
 *     tags: [Permisos]
 *     summary: Listar permisos
 *     responses:
 *       200:
 *         description: Lista de permisos
 */
export const getPermisos = async (_req: Request, res: Response) => {
  try {
    const permisos = await permisoService.listar();
    res.json(permisos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener permisos" });
  }
};

/**
 * @openapi
 * /api/permisos/{id}:
 *   get:
 *     tags: [Permisos]
 *     summary: Obtener permiso por ID
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Permiso encontrado
 *       404:
 *         description: Permiso no encontrado
 */
export const getPermisoById = async (req: Request, res: Response) => {
  try {
    const permiso = await permisoService.obtenerPorId(Number(req.params.id));
    if (!permiso) { res.status(404).json({ error: "Permiso no encontrado" }); return; }
    res.json(permiso);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el permiso" });
  }
};

/**
 * @openapi
 * /api/permisos:
 *   post:
 *     tags: [Permisos]
 *     summary: Crear permiso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rol_id, menu_id]
 *             properties:
 *               rol_id: { type: integer, example: 1 }
 *               menu_id: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Permiso creado
 */
export const createPermiso = async (req: Request, res: Response) => {
  try {
    const permiso = await permisoService.crear(req.body);
    res.status(201).json(permiso);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el permiso" });
  }
};

/**
 * @openapi
 * /api/permisos/{id}:
 *   put:
 *     tags: [Permisos]
 *     summary: Actualizar permiso
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               menu_id: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: Permiso actualizado
 */
export const updatePermiso = async (req: Request, res: Response) => {
  try {
    const permiso = await permisoService.actualizar(Number(req.params.id), req.body);
    res.json(permiso);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el permiso" });
  }
};

/**
 * @openapi
 * /api/permisos/{id}:
 *   delete:
 *     tags: [Permisos]
 *     summary: Desactivar permiso
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Permiso desactivado
 */
export const deletePermiso = async (req: Request, res: Response) => {
  try {
    const permiso = await permisoService.eliminar(Number(req.params.id));
    res.json({ message: "Permiso desactivado correctamente", permiso });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el permiso" });
  }
};

/**
 * @openapi
 * /api/permisos/rol/{id}:
 *   put:
 *     tags: [Permisos]
 *     summary: Reemplazar permisos de un rol (asignación masiva de menús)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer }, description: ID del rol }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [menu_ids]
 *             properties:
 *               menu_ids: { type: array, items: { type: integer }, example: [1, 2, 3] }
 *     responses:
 *       200:
 *         description: Permisos del rol reemplazados
 */
export const setPermisosDeRol = async (req: Request, res: Response) => {
  try {
    const permisos = await permisoService.reemplazarPermisosDeRol(Number(req.params.id), req.body.menu_ids);
    res.json(permisos);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar los permisos del rol" });
  }
};
