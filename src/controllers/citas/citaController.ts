import { Request, Response } from "express";
import * as citaService from "../../services/citaService";

export { existeConflictoDeHorario } from "../../services/citaService";

/**
 * @openapi
 * /api/citas:
 *   get:
 *     tags: [Citas]
 *     summary: Listar citas (paginado)
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer }, example: 1 }
 *       - { name: limit, in: query, schema: { type: integer }, example: 20 }
 *       - { name: fecha, in: query, schema: { type: string }, example: "2026-07-15" }
 *       - { name: estado_cita_id, in: query, schema: { type: integer }, example: 1 }
 *       - { name: doctor_id, in: query, schema: { type: integer }, example: 1 }
 *     responses:
 *       200:
 *         description: Citas paginadas
 */
export const getCitas = async (req: Request, res: Response) => {
  try {
    const result = await citaService.listar(req.query as any);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener citas" });
  }
};

/**
 * @openapi
 * /api/citas/{id}:
 *   get:
 *     tags: [Citas]
 *     summary: Obtener cita por ID
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Cita encontrada
 *       404:
 *         description: Cita no encontrada
 */
export const getCitaById = async (req: Request, res: Response) => {
  try {
    const cita = await citaService.obtenerPorId(Number(req.params.id));
    if (!cita) { res.status(404).json({ error: "Cita no encontrada" }); return; }
    res.json(cita);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la cita" });
  }
};

/**
 * @openapi
 * /api/citas:
 *   post:
 *     tags: [Citas]
 *     summary: Crear cita
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [horario_doctor_id, historia_clinica_id, cita_fecha, cita_motivo]
 *             properties:
 *               horario_doctor_id: { type: integer, example: 1 }
 *               historia_clinica_id: { type: integer, example: 1 }
 *               cita_fecha: { type: string, example: "2026-07-15" }
 *               cita_motivo: { type: string, example: "Examen general" }
 *     responses:
 *       201:
 *         description: Cita creada
 *       400:
 *         description: Conflicto de horario
 */
export const createCita = async (req: Request, res: Response) => {
  try {
    const cita = await citaService.crear(req.body);
    res.status(201).json(cita);
  } catch (error: any) {
    if (error.message?.includes("conflict")) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Error al crear la cita" });
  }
};

/**
 * @openapi
 * /api/citas/{id}:
 *   put:
 *     tags: [Citas]
 *     summary: Actualizar cita
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cita_fecha: { type: string, example: "2026-07-15" }
 *               cita_motivo: { type: string, example: "Examen general" }
 *     responses:
 *       200:
 *         description: Cita actualizada
 *       400:
 *         description: Conflicto de horario
 */
export const updateCita = async (req: Request, res: Response) => {
  try {
    const cita = await citaService.actualizar(Number(req.params.id), req.body);
    res.json(cita);
  } catch (error: any) {
    if (error.message?.includes("conflict")) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Error al actualizar la cita" });
  }
};

/**
 * @openapi
 * /api/citas/{id}:
 *   delete:
 *     tags: [Citas]
 *     summary: Cancelar cita (cambia estado a Cancelada)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Cita cancelada
 */
export const deleteCita = async (req: Request, res: Response) => {
  try {
    const cita = await citaService.cancelar(Number(req.params.id));
    res.json({ message: "Cita cancelada correctamente", cita });
  } catch (error) {
    res.status(500).json({ error: "Error al cancelar la cita" });
  }
};
