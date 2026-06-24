import { Request, Response } from "express";
import prisma from "../../config/prisma";

// GET /api/horarios-doctor
export const getHorariosDoctor = async (req: Request, res: Response) => {
  try {
    const horarios = await prisma.tbl_horario_doctor.findMany();
    res.json(horarios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener horarios de doctores" });
  }
};

// GET /api/horarios-doctor/:id
export const getHorarioDoctorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const horario = await prisma.tbl_horario_doctor.findUnique({
      where: { horario_doctor_id: Number(id) },
    });
    if (!horario) {
      res.status(404).json({ error: "Horario no encontrado" });
      return;
    }
    res.json(horario);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el horario" });
  }
};

// POST /api/horarios-doctor
export const createHorarioDoctor = async (req: Request, res: Response) => {
  try {
    const {
      doctor_id,
      horario_doctor_dia,
      horario_doctor_inicio,
      horario_doctor_fin,
      horario_doctor_estado,
    } = req.body;

    const horario = await prisma.tbl_horario_doctor.create({
      data: {
        doctor_id,
        horario_doctor_dia,
        horario_doctor_inicio: new Date(`1970-01-01T${horario_doctor_inicio}`),
        horario_doctor_fin: new Date(`1970-01-01T${horario_doctor_fin}`),
        horario_doctor_estado,
      },
    });
    res.status(201).json(horario);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el horario" });
  }
};

// PUT /api/horarios-doctor/:id
export const updateHorarioDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      doctor_id,
      horario_doctor_dia,
      horario_doctor_inicio,
      horario_doctor_fin,
      horario_doctor_estado,
    } = req.body;

    const horario = await prisma.tbl_horario_doctor.update({
      where: { horario_doctor_id: Number(id) },
      data: {
        doctor_id,
        horario_doctor_dia,
        horario_doctor_inicio: horario_doctor_inicio
          ? new Date(`1970-01-01T${horario_doctor_inicio}`)
          : undefined,
        horario_doctor_fin: horario_doctor_fin
          ? new Date(`1970-01-01T${horario_doctor_fin}`)
          : undefined,
        horario_doctor_estado,
      },
    });
    res.json(horario);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el horario" });
  }
};

// DELETE /api/horarios-doctor/:id (borrado lógico)
export const deleteHorarioDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const horario = await prisma.tbl_horario_doctor.update({
      where: { horario_doctor_id: Number(id) },
      data: { horario_doctor_estado: "I" },
    });
    res.json({ message: "Horario desactivado correctamente", horario });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el horario" });
  }
};