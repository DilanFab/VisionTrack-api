import { Request, Response } from "express";
import * as generoService from "../../services/generoService";

/**
 * @openapi
 * /api/generos:
 *   get:
 *     tags: [Generos]
 *     summary: Listar géneros
 *     responses:
 *       200:
 *         description: Lista de géneros
 *       500:
 *         description: Error del servidor
 */
export const getGeneros = async (_req: Request, res: Response) => {
  try {
    const generos = await generoService.listar();
    res.json(generos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener géneros" });
  }
};

/**
 * @openapi
 * /api/generos/{id}:
 *   get:
 *     tags: [Generos]
 *     summary: Obtener género por ID
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Género encontrado
 *       404:
 *         description: Género no encontrado
 */
export const getGeneroById = async (req: Request, res: Response) => {
  try {
    const genero = await generoService.obtenerPorId(Number(req.params.id));
    if (!genero) { res.status(404).json({ error: "Género no encontrado" }); return; }
    res.json(genero);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el género" });
  }
};

/**
 * @openapi
 * /api/generos:
 *   post:
 *     tags: [Generos]
 *     summary: Crear género
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [genero_nombre]
 *             properties:
 *               genero_nombre: { type: string, example: "Masculino" }
 *     responses:
 *       201:
 *         description: Género creado
 */
export const createGenero = async (req: Request, res: Response) => {
  try {
    const genero = await generoService.crear(req.body);
    res.status(201).json(genero);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el género" });
  }
};

/**
 * @openapi
 * /api/generos/{id}:
 *   put:
 *     tags: [Generos]
 *     summary: Actualizar género
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               genero_nombre: { type: string, example: "Masculino" }
 *     responses:
 *       200:
 *         description: Género actualizado
 */
export const updateGenero = async (req: Request, res: Response) => {
  try {
    const genero = await generoService.actualizar(Number(req.params.id), req.body);
    res.json(genero);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el género" });
  }
};

/**
 * @openapi
 * /api/generos/{id}:
 *   delete:
 *     tags: [Generos]
 *     summary: Desactivar género (borrado lógico)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Género desactivado
 */
export const deleteGenero = async (req: Request, res: Response) => {
  try {
    const genero = await generoService.eliminar(Number(req.params.id));
    res.json({ message: "Género desactivado correctamente", genero });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el género" });
  }
};
