import { Request, Response } from "express";
import prisma from "../../config/prisma";
import { getPagination, paginatedResponse } from "../../utils/pagination";
import { buildDateFilter, buildIntFilter } from "../../utils/filters";

const ESTADO_CITA_DEFECTO = "Programada";
const ESTADO_CITA_CANCELADA = "Cancelada";

const citaInclude = {
  horario_doctor: {
    include: {
      doctor: {
        include: {
          especialidad_medica: true,
          perfil: {
            include: {
              usuario: { include: { persona: true } },
            },
          },
        },
      },
    },
  },
  historia_clinica: {
    include: {
      perfil: {
        include: {
          usuario: { include: { persona: true } },
        },
      },
    },
  },
  estado_cita: true,
};

// Una cita ocupa un slot (doctor + horario recurrente + fecha real). Se
// considera "ocupado" si ya existe una cita activa (no cancelada) para ese
// mismo horario_doctor_id y cita_fecha exactos.
export const existeConflictoDeHorario = async (
  horario_doctor_id: number,
  cita_fecha: Date,
  excluirCitaId?: number
) => {
  const conflicto = await prisma.tbl_cita.findFirst({
    where: {
      horario_doctor_id,
      cita_fecha,
      estado_cita: { estado_cita_nombre: { not: ESTADO_CITA_CANCELADA } },
      ...(excluirCitaId ? { cita_id: { not: excluirCitaId } } : {}),
    },
  });
  return !!conflicto;
};

// GET /api/citas
export const getCitas = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPagination(req.query as { page?: string; limit?: string });
    const { fecha, estado_cita_id, doctor_id } = req.query as Record<string, string>;

    const where: Record<string, unknown> = {};
    const fechaFilter = buildDateFilter(fecha);
    if (fechaFilter) where.cita_fecha = fechaFilter;
    const estadoFilter = buildIntFilter(estado_cita_id);
    if (estadoFilter) where.estado_cita_id = estadoFilter;
    const doctorFilter = buildIntFilter(doctor_id);
    if (doctorFilter) where.horario_doctor = { doctor_id: doctorFilter };

    const [citas, total] = await Promise.all([
      prisma.tbl_cita.findMany({ where, include: citaInclude, skip, take: limit, orderBy: { cita_fecha: "desc" } }),
      prisma.tbl_cita.count({ where }),
    ]);

    res.json(paginatedResponse(citas, total, page, limit));
  } catch (error) {
    res.status(500).json({ error: "Error al obtener citas" });
  }
};

// GET /api/citas/:id
export const getCitaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cita = await prisma.tbl_cita.findUnique({
      where: { cita_id: Number(id) },
      include: citaInclude,
    });
    if (!cita) {
      res.status(404).json({ error: "Cita no encontrada" });
      return;
    }
    res.json(cita);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la cita" });
  }
};

// POST /api/citas
export const createCita = async (req: Request, res: Response) => {
  try {
    const { horario_doctor_id, historia_clinica_id, cita_fecha, cita_motivo } = req.body;

    const fecha = new Date(cita_fecha);

    const conflicto = await existeConflictoDeHorario(Number(horario_doctor_id), fecha);
    if (conflicto) {
      res.status(400).json({ error: "El doctor ya tiene una cita agendada en esa fecha y hora" });
      return;
    }

    const estadoProgramada = await prisma.tbl_estado_cita.findFirst({
      where: { estado_cita_nombre: ESTADO_CITA_DEFECTO },
    });
    if (!estadoProgramada) {
      res.status(500).json({
        error: `No existe un estado '${ESTADO_CITA_DEFECTO}' configurado en tbl_estado_cita`,
      });
      return;
    }

    const cita = await prisma.tbl_cita.create({
      data: {
        horario_doctor_id: Number(horario_doctor_id),
        historia_clinica_id: Number(historia_clinica_id),
        cita_fecha: fecha,
        cita_motivo,
        estado_cita_id: estadoProgramada.estado_cita_id,
      },
      include: citaInclude,
    });
    res.status(201).json(cita);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la cita" });
  }
};

// PUT /api/citas/:id
export const updateCita = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { horario_doctor_id, historia_clinica_id, cita_fecha, cita_motivo, estado_cita_id } = req.body;

    const fecha = new Date(cita_fecha);

    const conflicto = await existeConflictoDeHorario(Number(horario_doctor_id), fecha, Number(id));
    if (conflicto) {
      res.status(400).json({ error: "El doctor ya tiene una cita agendada en esa fecha y hora" });
      return;
    }

    const cita = await prisma.tbl_cita.update({
      where: { cita_id: Number(id) },
      data: {
        horario_doctor_id: Number(horario_doctor_id),
        historia_clinica_id: Number(historia_clinica_id),
        cita_fecha: fecha,
        cita_motivo,
        estado_cita_id: Number(estado_cita_id),
      },
      include: citaInclude,
    });
    res.json(cita);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la cita" });
  }
};

// DELETE /api/citas/:id (cancelación lógica)
export const deleteCita = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const estadoCancelada = await prisma.tbl_estado_cita.findFirst({
      where: { estado_cita_nombre: ESTADO_CITA_CANCELADA },
    });

    if (!estadoCancelada) {
      res.status(500).json({
        error: `No existe un estado '${ESTADO_CITA_CANCELADA}' configurado en tbl_estado_cita`,
      });
      return;
    }

    const cita = await prisma.tbl_cita.update({
      where: { cita_id: Number(id) },
      data: { estado_cita_id: estadoCancelada.estado_cita_id },
      include: citaInclude,
    });

    res.json({ message: "Cita cancelada correctamente", cita });
  } catch (error) {
    res.status(500).json({ error: "Error al cancelar la cita" });
  }
};
