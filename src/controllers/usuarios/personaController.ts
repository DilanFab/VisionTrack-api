import { Request, Response } from "express";
import * as personaService from "../../services/personaService";

/**
 * @openapi
 * /api/personas:
 *   get:
 *     tags: [Personas]
 *     summary: Listar personas (paginado)
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer }, example: 1 }
 *       - { name: limit, in: query, schema: { type: integer }, example: 20 }
 *       - { name: search, in: query, schema: { type: string }, example: "Juan" }
 *     responses:
 *       200:
 *         description: Personas paginadas
 */
export const getPersonas = async (req: Request, res: Response) => {
  try {
    const result = await personaService.listar(req.query as any);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener personas" });
  }
};

/**
 * @openapi
 * /api/personas/{id}:
 *   get:
 *     tags: [Personas]
 *     summary: Obtener persona por ID
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Persona encontrada
 *       404:
 *         description: Persona no encontrada
 */
export const getPersonaById = async (req: Request, res: Response) => {
  try {
    const persona = await personaService.obtenerPorId(Number(req.params.id));
    if (!persona) { res.status(404).json({ error: "Persona no encontrada" }); return; }
    res.json(persona);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la persona" });
  }
};

/**
 * @openapi
 * /api/personas:
 *   post:
 *     tags: [Personas]
 *     summary: Crear persona
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [genero_id, persona_cedula, persona_primer_nombre, persona_primer_apellido, persona_fecha_nacimiento, persona_direccion, persona_telefono, persona_correo]
 *             properties:
 *               genero_id: { type: integer, example: 1 }
 *               persona_cedula: { type: string, example: "1234567890" }
 *               persona_primer_nombre: { type: string, example: "Juan" }
 *               persona_primer_apellido: { type: string, example: "Perez" }
 *               persona_fecha_nacimiento: { type: string, example: "1990-01-01" }
 *               persona_direccion: { type: string, example: "Calle 123" }
 *               persona_telefono: { type: string, example: "0991234567" }
 *               persona_correo: { type: string, example: "juan@test.com" }
 *     responses:
 *       201:
 *         description: Persona creada
 */
export const createPersona = async (req: Request, res: Response) => {
  try {
    const persona = await personaService.crear(req.body);
    res.status(201).json(persona);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la persona" });
  }
};

/**
 * @openapi
 * /api/personas/{id}:
 *   put:
 *     tags: [Personas]
 *     summary: Actualizar persona
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               persona_primer_nombre: { type: string, example: "Juan" }
 *               persona_correo: { type: string, example: "juan@test.com" }
 *     responses:
 *       200:
 *         description: Persona actualizada
 */
export const updatePersona = async (req: Request, res: Response) => {
  try {
    const persona = await personaService.actualizar(Number(req.params.id), req.body);
    res.json(persona);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la persona" });
  }
};

/**
 * @openapi
 * /api/personas/{id}:
 *   delete:
 *     tags: [Personas]
 *     summary: Desactivar persona (borrado lógico)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Persona desactivada
 */
export const deletePersona = async (req: Request, res: Response) => {
  try {
    const persona = await personaService.eliminar(Number(req.params.id));
    res.json({ message: "Persona desactivada correctamente", persona });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar la persona" });
  }
};
