import { Request, Response } from "express";
import * as pacienteCompletoService from "../../services/pacienteCompletoService";

/**
 * @openapi
 * /api/pacientes-completos:
 *   get:
 *     tags: [PacientesCompletos]
 *     summary: Listar pacientes completos (paginado)
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer }, example: 1 }
 *       - { name: limit, in: query, schema: { type: integer }, example: 20 }
 *       - { name: search, in: query, schema: { type: string }, example: "Juan" }
 *     responses:
 *       200:
 *         description: Pacientes completos paginados
 */
export const getPacientesCompletos = async (req: Request, res: Response) => {
  try {
    const result = await pacienteCompletoService.listar(req.query as any);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los pacientes" });
  }
};

/**
 * @openapi
 * /api/pacientes-completos:
 *   post:
 *     tags: [PacientesCompletos]
 *     summary: Crear paciente completo (persona + usuario + perfil + historia clínica)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               persona: { type: object, description: Datos de la persona }
 *               usuario: { type: object, description: Datos del usuario }
 *     responses:
 *       201:
 *         description: Paciente completo creado
 *       400:
 *         description: Dato duplicado
 */
export const createPacienteCompleto = async (req: Request, res: Response) => {
  try {
    const paciente = await pacienteCompletoService.crear(req.body);
    res.status(201).json(paciente);
  } catch (error: any) {
    if (error.message?.includes("Ya existe") || error.message?.includes("ya está en uso") || error.message?.includes("No se encontró")) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Error al crear el paciente" });
  }
};

/**
 * @openapi
 * /api/pacientes-completos/{id}:
 *   put:
 *     tags: [PacientesCompletos]
 *     summary: Actualizar paciente completo
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               persona: { type: object }
 *               usuario: { type: object }
 *     responses:
 *       200:
 *         description: Paciente completo actualizado
 *       404:
 *         description: No encontrado
 */
export const updatePacienteCompleto = async (req: Request, res: Response) => {
  try {
    const paciente = await pacienteCompletoService.actualizar(Number(req.params.id), req.body);
    res.json(paciente);
  } catch (error: any) {
    if (error.message?.includes("no encontrado")) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Error al actualizar el paciente" });
  }
};

/**
 * @openapi
 * /api/pacientes-completos/{id}:
 *   delete:
 *     tags: [PacientesCompletos]
 *     summary: Desactivar paciente completo
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Paciente completo desactivado
 */
export const deletePacienteCompleto = async (req: Request, res: Response) => {
  try {
    const historia = await pacienteCompletoService.eliminar(Number(req.params.id));
    res.json({ message: "Paciente desactivado correctamente", historia });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el paciente" });
  }
};
