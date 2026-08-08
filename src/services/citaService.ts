import prisma from "../config/prisma";
import { getPagination, paginatedResponse } from "../utils/pagination";
import { buildDateFilter, buildIntFilter } from "../utils/filters";

const ESTADO_CITA_DEFECTO = "Programada";
const ESTADO_CITA_CANCELADA = "Cancelada";

export const citaInclude = {
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

export const listar = async (query: {
  page?: string;
  limit?: string;
  fecha?: string;
  estado_cita_id?: string;
  doctor_id?: string;
}) => {
  const { page, limit, skip } = getPagination(query);
  const where: Record<string, unknown> = {};
  const fechaFilter = buildDateFilter(query.fecha);
  if (fechaFilter) where.cita_fecha = fechaFilter;
  const estadoFilter = buildIntFilter(query.estado_cita_id);
  if (estadoFilter) where.estado_cita_id = estadoFilter;
  const doctorFilter = buildIntFilter(query.doctor_id);
  if (doctorFilter) where.horario_doctor = { doctor_id: doctorFilter };

  const [citas, total] = await Promise.all([
    prisma.tbl_cita.findMany({ where, include: citaInclude, skip, take: limit, orderBy: { cita_fecha: "desc" } }),
    prisma.tbl_cita.count({ where }),
  ]);

  return paginatedResponse(citas, total, page, limit);
};

export const obtenerPorId = async (id: number) => {
  return prisma.tbl_cita.findUnique({ where: { cita_id: id }, include: citaInclude });
};

export const crear = async (data: {
  horario_doctor_id: number;
  historia_clinica_id: number;
  cita_fecha: string;
  cita_motivo: string;
}) => {
  const fecha = new Date(data.cita_fecha);

  const conflicto = await existeConflictoDeHorario(data.horario_doctor_id, fecha);
  if (conflicto) {
    throw new Error("El doctor ya tiene una cita agendada en esa fecha y hora");
  }

  const estadoProgramada = await prisma.tbl_estado_cita.findFirst({
    where: { estado_cita_nombre: ESTADO_CITA_DEFECTO },
  });
  if (!estadoProgramada) {
    throw new Error(`No existe un estado '${ESTADO_CITA_DEFECTO}' configurado en tbl_estado_cita`);
  }

  return prisma.tbl_cita.create({
    data: {
      horario_doctor_id: data.horario_doctor_id,
      historia_clinica_id: data.historia_clinica_id,
      cita_fecha: fecha,
      cita_motivo: data.cita_motivo,
      estado_cita_id: estadoProgramada.estado_cita_id,
    },
    include: citaInclude,
  });
};

export const actualizar = async (id: number, data: {
  horario_doctor_id: number;
  historia_clinica_id: number;
  cita_fecha: string;
  cita_motivo: string;
  estado_cita_id: number;
}) => {
  const fecha = new Date(data.cita_fecha);

  const conflicto = await existeConflictoDeHorario(data.horario_doctor_id, fecha, id);
  if (conflicto) {
    throw new Error("El doctor ya tiene una cita agendada en esa fecha y hora");
  }

  return prisma.tbl_cita.update({
    where: { cita_id: id },
    data: {
      horario_doctor_id: data.horario_doctor_id,
      historia_clinica_id: data.historia_clinica_id,
      cita_fecha: fecha,
      cita_motivo: data.cita_motivo,
      estado_cita_id: data.estado_cita_id,
    },
    include: citaInclude,
  });
};

export const cancelar = async (id: number) => {
  const estadoCancelada = await prisma.tbl_estado_cita.findFirst({
    where: { estado_cita_nombre: ESTADO_CITA_CANCELADA },
  });
  if (!estadoCancelada) {
    throw new Error(`No existe un estado '${ESTADO_CITA_CANCELADA}' configurado en tbl_estado_cita`);
  }

  return prisma.tbl_cita.update({
    where: { cita_id: id },
    data: { estado_cita_id: estadoCancelada.estado_cita_id },
    include: citaInclude,
  });
};

export const listarPorPaciente = async (historiaClinicaId: number, query: { page?: string; limit?: string }) => {
  const { page, limit, skip } = getPagination(query);
  const where = { historia_clinica_id: historiaClinicaId };

  const [citas, total] = await Promise.all([
    prisma.tbl_cita.findMany({ where, include: citaInclude, skip, take: limit, orderBy: { cita_fecha: "desc" } }),
    prisma.tbl_cita.count({ where }),
  ]);

  return paginatedResponse(citas, total, page, limit);
};
