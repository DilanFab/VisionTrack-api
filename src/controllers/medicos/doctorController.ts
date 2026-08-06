import { Request, Response } from "express";
import * as doctorService from "../../services/doctorService";

/**
 * @openapi
 * /api/doctores:
 *   get:
 *     tags: [Doctores]
 *     summary: Listar doctores (paginado)
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer }, example: 1 }
 *       - { name: limit, in: query, schema: { type: integer }, example: 20 }
 *       - { name: especialidad_medica_id, in: query, schema: { type: integer }, example: 1 }
 *     responses:
 *       200:
 *         description: Doctores paginados
 */
export const getDoctores = async (req: Request, res: Response) => {
  try {
    const result = await doctorService.listar(req.query as any);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener doctores" });
  }
};

/**
 * @openapi
 * /api/doctores/{id}:
 *   get:
 *     tags: [Doctores]
 *     summary: Obtener doctor por ID
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Doctor encontrado
 *       404:
 *         description: Doctor no encontrado
 */
export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const doctor = await doctorService.obtenerPorId(Number(req.params.id));
    if (!doctor) { res.status(404).json({ error: "Doctor no encontrado" }); return; }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el doctor" });
  }
};

/**
 * @openapi
 * /api/doctores:
 *   post:
 *     tags: [Doctores]
 *     summary: Crear doctor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [especialidad_medica_id, perfil_id]
 *             properties:
 *               especialidad_medica_id: { type: integer, example: 1 }
 *               perfil_id: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Doctor creado
 */
export const createDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = await doctorService.crear(req.body);
    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el doctor" });
  }
};

/**
 * @openapi
 * /api/doctores/{id}:
 *   put:
 *     tags: [Doctores]
 *     summary: Actualizar doctor
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               especialidad_medica_id: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: Doctor actualizado
 */
export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = await doctorService.actualizar(Number(req.params.id), req.body);
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el doctor" });
  }
};

/**
 * @openapi
 * /api/doctores/{id}:
 *   delete:
 *     tags: [Doctores]
 *     summary: Desactivar doctor
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Doctor desactivado
 */
export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = await doctorService.eliminar(Number(req.params.id));
    res.json({ message: "Doctor desactivado correctamente", doctor });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el doctor" });
  }
};
