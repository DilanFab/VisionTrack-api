import prisma from "../config/prisma";
import { getPagination, paginatedResponse } from "../utils/pagination";
import { buildEstadoFilter, buildIntFilter } from "../utils/filters";

export const listar = async (query: { page?: string; limit?: string; historia_clinica_estado?: string; paciente_id?: string }) => {
  const { page, limit, skip } = getPagination(query);
  const where: Record<string, unknown> = {};
  const estadoFilter = buildEstadoFilter(query.historia_clinica_estado);
  if (estadoFilter) where.historia_clinica_estado = estadoFilter;
  const pacienteFilter = buildIntFilter(query.paciente_id);
  if (pacienteFilter) where.paciente_id = pacienteFilter;

  const [historias, total] = await Promise.all([
    prisma.tbl_historia_clinica.findMany({ where, skip, take: limit }),
    prisma.tbl_historia_clinica.count({ where }),
  ]);

  return paginatedResponse(historias, total, page, limit);
};

export const obtenerPorId = async (id: number) => {
  return prisma.tbl_historia_clinica.findUnique({ where: { historia_clinica_id: id } });
};

export const crear = async (data: {
  paciente_id: number;
  historia_clinica_numero: string;
  historia_clinica_fecha_apertura: string;
  historia_clinica_estado: string;
}) => {
  return prisma.tbl_historia_clinica.create({
    data: {
      ...data,
      historia_clinica_fecha_apertura: new Date(data.historia_clinica_fecha_apertura),
    },
  });
};

export const actualizar = async (id: number, data: {
  paciente_id: number;
  historia_clinica_numero: string;
  historia_clinica_fecha_apertura?: string;
  historia_clinica_estado: string;
}) => {
  return prisma.tbl_historia_clinica.update({
    where: { historia_clinica_id: id },
    data: {
      ...data,
      historia_clinica_fecha_apertura: data.historia_clinica_fecha_apertura
        ? new Date(data.historia_clinica_fecha_apertura)
        : undefined,
    },
  });
};

export const eliminar = async (id: number) => {
  return prisma.tbl_historia_clinica.update({
    where: { historia_clinica_id: id },
    data: { historia_clinica_estado: "I" },
  });
};
