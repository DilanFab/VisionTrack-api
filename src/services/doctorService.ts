import prisma from "../config/prisma";
import { getPagination, paginatedResponse } from "../utils/pagination";
import { buildEstadoFilter, buildIntFilter } from "../utils/filters";

export const listar = async (query: { page?: string; limit?: string; especialidad_medica_id?: string; doctor_estado?: string }) => {
  const { page, limit, skip } = getPagination(query);
  const where: Record<string, unknown> = {};
  const espFilter = buildIntFilter(query.especialidad_medica_id);
  if (espFilter) where.especialidad_medica_id = espFilter;
  const estadoFilter = buildEstadoFilter(query.doctor_estado);
  if (estadoFilter) where.doctor_estado = estadoFilter;

  const [doctores, total] = await Promise.all([
    prisma.tbl_doctor.findMany({ where, skip, take: limit }),
    prisma.tbl_doctor.count({ where }),
  ]);

  return paginatedResponse(doctores, total, page, limit);
};

export const obtenerPorId = async (id: number) => {
  return prisma.tbl_doctor.findUnique({ where: { doctor_id: id } });
};

export const crear = async (data: { especialidad_medica_id: number; perfil_id: number; doctor_estado: string }) => {
  return prisma.tbl_doctor.create({ data });
};

export const actualizar = async (id: number, data: { especialidad_medica_id: number; perfil_id: number; doctor_estado: string }) => {
  return prisma.tbl_doctor.update({ where: { doctor_id: id }, data });
};

export const eliminar = async (id: number) => {
  return prisma.tbl_doctor.update({ where: { doctor_id: id }, data: { doctor_estado: "I" } });
};
