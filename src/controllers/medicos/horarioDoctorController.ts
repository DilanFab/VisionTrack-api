import { Request, Response } from "express";
import * as horarioDoctorService from "../../services/horarioDoctorService";

/**
 * @openapi
 * /api/horarios-doctor:
 *   get:
 *     tags: [HorariosDoctor]
 *     summary: Listar horarios de doctor (paginado)
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer }, example: 1 }
 *       - { name: limit, in: query, schema: { type: integer }, example: 20 }
 *       - { name: doctor_id, in: query, schema: { type: integer }, example: 1 }
 *     responses:
 *       200:
 *         description: Horarios paginados
 */
export const getHorariosDoctor = async (req: Request, res: Response) => {
  try {
    const result = await horarioDoctorService.listar(req.query as any);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener horarios de doctores" });
  }
};

/**
 * @openapi
 * /api/horarios-doctor/doctor/{doctorId}:
 *   get:
 *     tags: [HorariosDoctor]
 *     summary: Listar horarios de un doctor específico
 *     parameters:
 *       - { name: doctorId, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Horarios del doctor
 */
export const getHorariosPorDoctor = async (req: Request, res: Response) => {
  try {
    const horarios = await horarioDoctorService.listarPorDoctor(Number(req.params.doctorId));
    res.json(horarios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los horarios del doctor" });
  }
};

/**
 * @openapi
 * /api/horarios-doctor/doctor/{doctorId}:
 *   put:
 *     tags: [HorariosDoctor]
 *     summary: Reemplazar horarios de un doctor
 *     parameters:
 *       - { name: doctorId, in: path, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [horarios]
 *             properties:
 *               horarios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     horario_doctor_dia: { type: string, example: "Lunes" }
 *                     horario_doctor_inicio: { type: string, example: "08:00" }
 *                     horario_doctor_fin: { type: string, example: "12:00" }
 *     responses:
 *       200:
 *         description: Horarios reemplazados
 */
export const setHorariosPorDoctor = async (req: Request, res: Response) => {
  try {
    const horarios = await horarioDoctorService.reemplazarHorariosPorDoctor(Number(req.params.doctorId), req.body.horarios);
    res.json(horarios);
  } catch (error) {
    res.status(500).json({ error: "Error al guardar el horario del doctor" });
  }
};

/**
 * @openapi
 * /api/horarios-doctor/{id}:
 *   get:
 *     tags: [HorariosDoctor]
 *     summary: Obtener horario por ID
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Horario encontrado
 *       404:
 *         description: Horario no encontrado
 */
export const getHorarioDoctorById = async (req: Request, res: Response) => {
  try {
    const horario = await horarioDoctorService.obtenerPorId(Number(req.params.id));
    if (!horario) { res.status(404).json({ error: "Horario no encontrado" }); return; }
    res.json(horario);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el horario" });
  }
};

/**
 * @openapi
 * /api/horarios-doctor:
 *   post:
 *     tags: [HorariosDoctor]
 *     summary: Crear horario de doctor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [doctor_id, horario_doctor_dia, horario_doctor_inicio, horario_doctor_fin]
 *             properties:
 *               doctor_id: { type: integer, example: 1 }
 *               horario_doctor_dia: { type: string, example: "Lunes" }
 *               horario_doctor_inicio: { type: string, example: "08:00" }
 *               horario_doctor_fin: { type: string, example: "12:00" }
 *     responses:
 *       201:
 *         description: Horario creado
 */
export const createHorarioDoctor = async (req: Request, res: Response) => {
  try {
    const horario = await horarioDoctorService.crear(req.body);
    res.status(201).json(horario);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el horario" });
  }
};

/**
 * @openapi
 * /api/horarios-doctor/{id}:
 *   put:
 *     tags: [HorariosDoctor]
 *     summary: Actualizar horario de doctor
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               horario_doctor_inicio: { type: string, example: "08:00" }
 *     responses:
 *       200:
 *         description: Horario actualizado
 */
export const updateHorarioDoctor = async (req: Request, res: Response) => {
  try {
    const horario = await horarioDoctorService.actualizar(Number(req.params.id), req.body);
    res.json(horario);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el horario" });
  }
};

/**
 * @openapi
 * /api/horarios-doctor/{id}:
 *   delete:
 *     tags: [HorariosDoctor]
 *     summary: Desactivar horario de doctor
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Horario desactivado
 */
export const deleteHorarioDoctor = async (req: Request, res: Response) => {
  try {
    const horario = await horarioDoctorService.eliminar(Number(req.params.id));
    res.json({ message: "Horario desactivado correctamente", horario });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el horario" });
  }
};
