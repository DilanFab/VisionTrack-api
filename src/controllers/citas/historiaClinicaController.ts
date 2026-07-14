import { Request, Response } from "express";
import * as historiaClinicaService from "../../services/historiaClinicaService";

/**
 * @openapi
 * /api/historias-clinicas:
 *   get:
 *     tags: [HistoriasClinicas]
 *     summary: Listar historias clínicas (paginado)
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer }, example: 1 }
 *       - { name: limit, in: query, schema: { type: integer }, example: 20 }
 *       - { name: search, in: query, schema: { type: string }, example: "Juan" }
 *     responses:
 *       200:
 *         description: Historias clínicas paginadas
 */
export const getHistoriasClinicas = async (req: Request, res: Response) => {
  try {
    const result = await historiaClinicaService.listar(req.query as any);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener historias clínicas" });
  }
};

/**
 * @openapi
 * /api/historias-clinicas/{id}:
 *   get:
 *     tags: [HistoriasClinicas]
 *     summary: Obtener historia clínica por ID
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Historia clínica encontrada
 *       404:
 *         description: No encontrada
 */
export const getHistoriaClinicaById = async (req: Request, res: Response) => {
  try {
    const historia = await historiaClinicaService.obtenerPorId(Number(req.params.id));
    if (!historia) { res.status(404).json({ error: "Historia clínica no encontrada" }); return; }
    res.json(historia);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la historia clínica" });
  }
};

/**
 * @openapi
 * /api/historias-clinicas:
 *   post:
 *     tags: [HistoriasClinicas]
 *     summary: Crear historia clínica
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paciente_id]
 *             properties:
 *               paciente_id: { type: integer, example: 1 }
 *               historia_clinica_numero: { type: string, example: "HC-001" }
 *     responses:
 *       201:
 *         description: Historia clínica creada
 */
export const createHistoriaClinica = async (req: Request, res: Response) => {
  try {
    const historia = await historiaClinicaService.crear(req.body);
    res.status(201).json(historia);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la historia clínica" });
  }
};

/**
 * @openapi
 * /api/historias-clinicas/{id}:
 *   put:
 *     tags: [HistoriasClinicas]
 *     summary: Actualizar historia clínica
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               historia_clinica_numero: { type: string, example: "HC-001" }
 *     responses:
 *       200:
 *         description: Historia clínica actualizada
 */
export const updateHistoriaClinica = async (req: Request, res: Response) => {
  try {
    const historia = await historiaClinicaService.actualizar(Number(req.params.id), req.body);
    res.json(historia);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la historia clínica" });
  }
};

/**
 * @openapi
 * /api/historias-clinicas/{id}:
 *   delete:
 *     tags: [HistoriasClinicas]
 *     summary: Desactivar historia clínica
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Historia clínica desactivada
 */
export const deleteHistoriaClinica = async (req: Request, res: Response) => {
  try {
    const historia = await historiaClinicaService.eliminar(Number(req.params.id));
    res.json({ message: "Historia clínica desactivada correctamente", historia });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar la historia clínica" });
  }
};
