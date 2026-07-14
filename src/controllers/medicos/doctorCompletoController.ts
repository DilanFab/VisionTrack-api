import { Request, Response } from "express";
import * as doctorCompletoService from "../../services/doctorCompletoService";

/**
 * @openapi
 * /api/doctores-completos:
 *   get:
 *     tags: [DoctoresCompletos]
 *     summary: Listar doctores completos
 *     responses:
 *       200:
 *         description: Lista de doctores completos
 */
export const getDoctoresCompletos = async (_req: Request, res: Response) => {
  try {
    const doctores = await doctorCompletoService.listar();
    res.json(doctores);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los doctores" });
  }
};

/**
 * @openapi
 * /api/doctores-completos:
 *   post:
 *     tags: [DoctoresCompletos]
 *     summary: Crear doctor completo (persona + usuario + perfil + doctor)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               persona: { type: object, description: Datos de la persona }
 *               usuario: { type: object, description: Datos del usuario }
 *               especialidad_medica_id: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Doctor completo creado
 *       400:
 *         description: Dato duplicado
 */
export const createDoctorCompleto = async (req: Request, res: Response) => {
  try {
    const doctor = await doctorCompletoService.crear(req.body);
    res.status(201).json(doctor);
  } catch (error: any) {
    if (error.message?.includes("Ya existe") || error.message?.includes("ya está en uso") || error.message?.includes("No se encontró")) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Error al crear el doctor" });
  }
};

/**
 * @openapi
 * /api/doctores-completos/{id}:
 *   put:
 *     tags: [DoctoresCompletos]
 *     summary: Actualizar doctor completo
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
 *         description: Doctor completo actualizado
 *       404:
 *         description: No encontrado
 */
export const updateDoctorCompleto = async (req: Request, res: Response) => {
  try {
    const doctor = await doctorCompletoService.actualizar(Number(req.params.id), req.body);
    res.json(doctor);
  } catch (error: any) {
    if (error.message?.includes("no encontrado")) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Error al actualizar el doctor" });
  }
};

/**
 * @openapi
 * /api/doctores-completos/{id}:
 *   delete:
 *     tags: [DoctoresCompletos]
 *     summary: Desactivar doctor completo
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Doctor completo desactivado
 */
export const deleteDoctorCompleto = async (req: Request, res: Response) => {
  try {
    const doctor = await doctorCompletoService.eliminar(Number(req.params.id));
    res.json({ message: "Doctor desactivado correctamente", doctor });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el doctor" });
  }
};
