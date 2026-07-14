import { Request, Response } from "express";
import prisma from "../../config/prisma";
import { getPagination, paginatedResponse } from "../../utils/pagination";
import { buildIntFilter, buildEstadoFilter } from "../../utils/filters";

// GET /api/horarios-doctor
export const getHorariosDoctor = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPagination(req.query as { page?: string; limit?: string });
    const { doctor_id, horario_doctor_estado } = req.query as Record<string, string>;

    const where: Record<string, unknown> = {};
    const doctorFilter = buildIntFilter(doctor_id);
    if (doctorFilter) where.doctor_id = doctorFilter;
    const estadoFilter = buildEstadoFilter(horario_doctor_estado);
    if (estadoFilter) where.horario_doctor_estado = estadoFilter;

    const [horarios, total] = await Promise.all([
      prisma.tbl_horario_doctor.findMany({ where, skip, take: limit }),
      prisma.tbl_horario_doctor.count({ where }),
    ]);

    res.json(paginatedResponse(horarios, total, page, limit));
  } catch (error) {
    res.status(500).json({ error: "Error al obtener horarios de doctores" });
  }
};

// GET /api/horarios-doctor/doctor/:doctorId
export const getHorariosPorDoctor = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const horarios = await prisma.tbl_horario_doctor.findMany({
      where: { doctor_id: Number(doctorId), horario_doctor_estado: "A" },
    });
    res.json(horarios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los horarios del doctor" });
  }
};

// PUT /api/horarios-doctor/doctor/:doctorId
// Reemplaza por completo el horario del doctor: borra físicamente los horarios
// previos y guarda los nuevos, evitando registros duplicados o residuales.
export const setHorariosPorDoctor = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const { horarios } = req.body;

    await prisma.$transaction(async (tx) => {
      await tx.tbl_horario_doctor.deleteMany({ where: { doctor_id: Number(doctorId) } });
      if (Array.isArray(horarios) && horarios.length > 0) {
        await tx.tbl_horario_doctor.createMany({
          data: horarios.map((h: any) => ({
            doctor_id: Number(doctorId),
            horario_doctor_dia: h.horario_doctor_dia,
            horario_doctor_inicio: new Date(`1970-01-01T${h.horario_doctor_inicio}`),
            horario_doctor_fin: new Date(`1970-01-01T${h.horario_doctor_fin}`),
            horario_doctor_estado: "A",
          })),
        });
      }
    });

    const horariosActualizados = await prisma.tbl_horario_doctor.findMany({
      where: { doctor_id: Number(doctorId), horario_doctor_estado: "A" },
    });
    res.json(horariosActualizados);
  } catch (error) {
    res.status(500).json({ error: "Error al guardar el horario del doctor" });
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