import prisma from "../config/prisma";
import { getPagination, paginatedResponse } from "../utils/pagination";
import { buildIntFilter, buildEstadoFilter } from "../utils/filters";
import { enum_dias } from "@prisma/client";

export const listar = async (query: { page?: string; limit?: string; doctor_id?: string; horario_doctor_estado?: string }) => {
  const { page, limit, skip } = getPagination(query);
  const where: Record<string, unknown> = {};
  const doctorFilter = buildIntFilter(query.doctor_id);
  if (doctorFilter) where.doctor_id = doctorFilter;
  const estadoFilter = buildEstadoFilter(query.horario_doctor_estado);
  if (estadoFilter) where.horario_doctor_estado = estadoFilter;

  const [horarios, total] = await Promise.all([
    prisma.tbl_horario_doctor.findMany({ where, skip, take: limit }),
    prisma.tbl_horario_doctor.count({ where }),
  ]);

  return paginatedResponse(horarios, total, page, limit);
};

export const listarPorDoctor = async (doctorId: number) => {
  return prisma.tbl_horario_doctor.findMany({
    where: { doctor_id: doctorId, horario_doctor_estado: "A" },
  });
};

export const obtenerPorId = async (id: number) => {
  return prisma.tbl_horario_doctor.findUnique({ where: { horario_doctor_id: id } });
};

export const crear = async (data: {
  doctor_id: number;
  horario_doctor_dia: enum_dias;
  horario_doctor_inicio: string;
  horario_doctor_fin: string;
  horario_doctor_estado: string;
}) => {
  return prisma.tbl_horario_doctor.create({
    data: {
      ...data,
      horario_doctor_inicio: new Date(`1970-01-01T${data.horario_doctor_inicio}`),
      horario_doctor_fin: new Date(`1970-01-01T${data.horario_doctor_fin}`),
    },
  });
};

export const actualizar = async (id: number, data: {
  doctor_id: number;
  horario_doctor_dia: enum_dias;
  horario_doctor_inicio?: string;
  horario_doctor_fin?: string;
  horario_doctor_estado: string;
}) => {
  return prisma.tbl_horario_doctor.update({
    where: { horario_doctor_id: id },
    data: {
      doctor_id: data.doctor_id,
      horario_doctor_dia: data.horario_doctor_dia,
      horario_doctor_inicio: data.horario_doctor_inicio ? new Date(`1970-01-01T${data.horario_doctor_inicio}`) : undefined,
      horario_doctor_fin: data.horario_doctor_fin ? new Date(`1970-01-01T${data.horario_doctor_fin}`) : undefined,
      horario_doctor_estado: data.horario_doctor_estado,
    },
  });
};

export const eliminar = async (id: number) => {
  return prisma.tbl_horario_doctor.update({ where: { horario_doctor_id: id }, data: { horario_doctor_estado: "I" } });
};

export const reemplazarHorariosPorDoctor = async (doctorId: number, horarios: Array<{ horario_doctor_dia: enum_dias; horario_doctor_inicio: string; horario_doctor_fin: string }>) => {
  await prisma.$transaction(async (tx) => {
    await tx.tbl_horario_doctor.deleteMany({ where: { doctor_id: doctorId } });
    if (Array.isArray(horarios) && horarios.length > 0) {
      await tx.tbl_horario_doctor.createMany({
        data: horarios.map((h) => ({
          doctor_id: doctorId,
          horario_doctor_dia: h.horario_doctor_dia,
          horario_doctor_inicio: new Date(`1970-01-01T${h.horario_doctor_inicio}`),
          horario_doctor_fin: new Date(`1970-01-01T${h.horario_doctor_fin}`),
          horario_doctor_estado: "A",
        })),
      });
    }
  });
  return prisma.tbl_horario_doctor.findMany({
    where: { doctor_id: doctorId, horario_doctor_estado: "A" },
  });
};
