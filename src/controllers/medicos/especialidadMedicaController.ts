import { Request, Response } from "express";
import * as especialidadMedicaService from "../../services/especialidadMedicaService";

/**
 * @openapi
 * /api/especialidades-medicas:
 *   get:
 *     tags: [EspecialidadesMedicas]
 *     summary: Listar especialidades médicas
 *     responses:
 *       200:
 *         description: Lista de especialidades médicas
 */
export const getEspecialidadesMedicas = async (_req: Request, res: Response) => {
  try {
    const especialidades = await especialidadMedicaService.listar();
    res.json(especialidades);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener especialidades médicas" });
  }
};

/**
 * @openapi
 * /api/especialidades-medicas/{id}:
 *   get:
 *     tags: [EspecialidadesMedicas]
 *     summary: Obtener especialidad médica por ID
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Especialidad médica encontrada
 *       404:
 *         description: No encontrada
 */
export const getEspecialidadMedicaById = async (req: Request, res: Response) => {
  try {
    const especialidad = await especialidadMedicaService.obtenerPorId(Number(req.params.id));
    if (!especialidad) { res.status(404).json({ error: "Especialidad médica no encontrada" }); return; }
    res.json(especialidad);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la especialidad médica" });
  }
};

/**
 * @openapi
 * /api/especialidades-medicas:
 *   post:
 *     tags: [EspecialidadesMedicas]
 *     summary: Crear especialidad médica
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [especialidad_medica_nombre]
 *             properties:
 *               especialidad_medica_nombre: { type: string, example: "Optometría" }
 *               especialidad_medica_descripcion: { type: string, example: "Exámenes visuales" }
 *     responses:
 *       201:
 *         description: Especialidad médica creada
 */
export const createEspecialidadMedica = async (req: Request, res: Response) => {
  try {
    const especialidad = await especialidadMedicaService.crear(req.body);
    res.status(201).json(especialidad);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la especialidad médica" });
  }
};

/**
 * @openapi
 * /api/especialidades-medicas/{id}:
 *   put:
 *     tags: [EspecialidadesMedicas]
 *     summary: Actualizar especialidad médica
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               especialidad_medica_nombre: { type: string, example: "Optometría" }
 *     responses:
 *       200:
 *         description: Especialidad médica actualizada
 */
export const updateEspecialidadMedica = async (req: Request, res: Response) => {
  try {
    const especialidad = await especialidadMedicaService.actualizar(Number(req.params.id), req.body);
    res.json(especialidad);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la especialidad médica" });
  }
};

/**
 * @openapi
 * /api/especialidades-medicas/{id}:
 *   delete:
 *     tags: [EspecialidadesMedicas]
 *     summary: Desactivar especialidad médica
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Especialidad médica desactivada
 */
export const deleteEspecialidadMedica = async (req: Request, res: Response) => {
  try {
    const especialidad = await especialidadMedicaService.eliminar(Number(req.params.id));
    res.json({ message: "Especialidad médica desactivada correctamente", especialidad });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar la especialidad médica" });
  }
};
