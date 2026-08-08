import { Request, Response } from "express";
import * as perfilService from "../../services/perfilService";

/**
 * @openapi
 * /api/perfiles:
 *   get:
 *     tags: [Perfiles]
 *     summary: Listar perfiles
 *     responses:
 *       200:
 *         description: Lista de perfiles
 */
export const getPerfiles = async (_req: Request, res: Response) => {
  try {
    const perfiles = await perfilService.listar();
    res.json(perfiles);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener perfiles" });
  }
};

/**
 * @openapi
 * /api/perfiles/{id}:
 *   get:
 *     tags: [Perfiles]
 *     summary: Obtener perfil por ID
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Perfil encontrado
 *       404:
 *         description: Perfil no encontrado
 */
export const getPerfilById = async (req: Request, res: Response) => {
  try {
    const perfil = await perfilService.obtenerPorId(Number(req.params.id));
    if (!perfil) { res.status(404).json({ error: "Perfil no encontrado" }); return; }
    res.json(perfil);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
};

/**
 * @openapi
 * /api/perfiles:
 *   post:
 *     tags: [Perfiles]
 *     summary: Crear perfil
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [usuario_id, rol_id]
 *             properties:
 *               usuario_id: { type: integer, example: 1 }
 *               rol_id: { type: integer, example: 4 }
 *     responses:
 *       201:
 *         description: Perfil creado
 */
export const createPerfil = async (req: Request, res: Response) => {
  try {
    const perfil = await perfilService.crear(req.body);
    res.status(201).json(perfil);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el perfil" });
  }
};

/**
 * @openapi
 * /api/perfiles/{id}:
 *   put:
 *     tags: [Perfiles]
 *     summary: Actualizar perfil
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rol_id: { type: integer, example: 4 }
 *     responses:
 *       200:
 *         description: Perfil actualizado
 */
export const updatePerfil = async (req: Request, res: Response) => {
  try {
    const perfil = await perfilService.actualizar(Number(req.params.id), req.body);
    res.json(perfil);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el perfil" });
  }
};

/**
 * @openapi
 * /api/perfiles/{id}:
 *   delete:
 *     tags: [Perfiles]
 *     summary: Desactivar perfil
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Perfil desactivado
 */
export const deletePerfil = async (req: Request, res: Response) => {
  try {
    const perfil = await perfilService.eliminar(Number(req.params.id));
    res.json({ message: "Perfil desactivado correctamente", perfil });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el perfil" });
  }
};
