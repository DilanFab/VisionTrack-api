import { Request, Response } from "express";
import * as estadoCitaService from "../../services/estadoCitaService";

/**
 * @openapi
 * /api/estados-cita:
 *   get:
 *     tags: [EstadosCita]
 *     summary: Listar estados de cita
 *     responses:
 *       200:
 *         description: Lista de estados de cita
 */
export const getEstadosCita = async (_req: Request, res: Response) => {
  try {
    const estados = await estadoCitaService.listar();
    res.json(estados);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener estados de cita" });
  }
};

/**
 * @openapi
 * /api/estados-cita/{id}:
 *   get:
 *     tags: [EstadosCita]
 *     summary: Obtener estado de cita por ID
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Estado de cita encontrado
 *       404:
 *         description: No encontrado
 */
export const getEstadoCitaById = async (req: Request, res: Response) => {
  try {
    const estado = await estadoCitaService.obtenerPorId(Number(req.params.id));
    if (!estado) { res.status(404).json({ error: "Estado de cita no encontrado" }); return; }
    res.json(estado);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el estado de cita" });
  }
};

/**
 * @openapi
 * /api/estados-cita:
 *   post:
 *     tags: [EstadosCita]
 *     summary: Crear estado de cita
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado_cita_nombre]
 *             properties:
 *               estado_cita_nombre: { type: string, example: "Programada" }
 *               estado_cita_descripcion: { type: string, example: "Cita programada" }
 *     responses:
 *       201:
 *         description: Estado de cita creado
 */
export const createEstadoCita = async (req: Request, res: Response) => {
  try {
    const estado = await estadoCitaService.crear(req.body);
    res.status(201).json(estado);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el estado de cita" });
  }
};

/**
 * @openapi
 * /api/estados-cita/{id}:
 *   put:
 *     tags: [EstadosCita]
 *     summary: Actualizar estado de cita
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado_cita_nombre: { type: string, example: "Programada" }
 *     responses:
 *       200:
 *         description: Estado de cita actualizado
 */
export const updateEstadoCita = async (req: Request, res: Response) => {
  try {
    const estado = await estadoCitaService.actualizar(Number(req.params.id), req.body);
    res.json(estado);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el estado de cita" });
  }
};

/**
 * @openapi
 * /api/estados-cita/{id}:
 *   delete:
 *     tags: [EstadosCita]
 *     summary: Desactivar estado de cita
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Estado de cita desactivado
 */
export const deleteEstadoCita = async (req: Request, res: Response) => {
  try {
    const estado = await estadoCitaService.eliminar(Number(req.params.id));
    res.json({ message: "Estado de cita desactivado correctamente", estado });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el estado de cita" });
  }
};
