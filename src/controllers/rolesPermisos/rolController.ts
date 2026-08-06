import { Request, Response } from "express";
import * as rolService from "../../services/rolService";

/**
 * @openapi
 * /api/roles:
 *   get:
 *     tags: [Roles]
 *     summary: Listar roles
 *     responses:
 *       200:
 *         description: Lista de roles
 */
export const getRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await rolService.listar();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener roles" });
  }
};

/**
 * @openapi
 * /api/roles/{id}:
 *   get:
 *     tags: [Roles]
 *     summary: Obtener rol por ID
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Rol encontrado
 *       404:
 *         description: Rol no encontrado
 */
export const getRolById = async (req: Request, res: Response) => {
  try {
    const rol = await rolService.obtenerPorId(Number(req.params.id));
    if (!rol) { res.status(404).json({ error: "Rol no encontrado" }); return; }
    res.json(rol);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el rol" });
  }
};

/**
 * @openapi
 * /api/roles:
 *   post:
 *     tags: [Roles]
 *     summary: Crear rol
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rol_nombre]
 *             properties:
 *               rol_nombre: { type: string, example: "Recepcionista" }
 *               rol_descripcion: { type: string, example: "Atención al cliente" }
 *     responses:
 *       201:
 *         description: Rol creado
 */
export const createRol = async (req: Request, res: Response) => {
  try {
    const rol = await rolService.crear(req.body);
    res.status(201).json(rol);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el rol" });
  }
};

/**
 * @openapi
 * /api/roles/{id}:
 *   put:
 *     tags: [Roles]
 *     summary: Actualizar rol
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rol_nombre: { type: string, example: "Recepcionista" }
 *     responses:
 *       200:
 *         description: Rol actualizado
 */
export const updateRol = async (req: Request, res: Response) => {
  try {
    const rol = await rolService.actualizar(Number(req.params.id), req.body);
    res.json(rol);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el rol" });
  }
};

/**
 * @openapi
 * /api/roles/{id}:
 *   delete:
 *     tags: [Roles]
 *     summary: Desactivar rol
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Rol desactivado
 */
export const deleteRol = async (req: Request, res: Response) => {
  try {
    const rol = await rolService.eliminar(Number(req.params.id));
    res.json({ message: "Rol desactivado correctamente", rol });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el rol" });
  }
};
