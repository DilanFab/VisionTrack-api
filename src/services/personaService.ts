import prisma from "../config/prisma";
import { getPagination, paginatedResponse } from "../utils/pagination";
import { buildSearchFilter } from "../utils/filters";

const SEARCH_FIELDS = ["persona_primer_nombre", "persona_primer_apellido", "persona_cedula", "persona_correo"];

export const listar = async (query: { page?: string; limit?: string; search?: string }) => {
  const { page, limit, skip } = getPagination(query);
  const where: Record<string, unknown> = {};
  const searchFilters = buildSearchFilter(query.search, SEARCH_FIELDS);
  if (searchFilters) where.OR = searchFilters;

  const [personas, total] = await Promise.all([
    prisma.tbl_persona.findMany({ where, skip, take: limit }),
    prisma.tbl_persona.count({ where }),
  ]);

  return paginatedResponse(personas, total, page, limit);
};

export const obtenerPorId = async (id: number) => {
  return prisma.tbl_persona.findUnique({ where: { persona_id: id } });
};

export const crear = async (data: {
  genero_id: number;
  persona_cedula: string;
  persona_primer_nombre: string;
  persona_segundo_nombre?: string | null;
  persona_primer_apellido: string;
  persona_segundo_apellido?: string | null;
  persona_fecha_nacimiento: string;
  persona_direccion: string;
  persona_telefono: string;
  persona_correo: string;
  persona_estado: string;
}) => {
  return prisma.tbl_persona.create({
    data: {
      ...data,
      persona_fecha_nacimiento: new Date(data.persona_fecha_nacimiento),
      persona_segundo_nombre: data.persona_segundo_nombre || null,
      persona_segundo_apellido: data.persona_segundo_apellido || null,
    },
  });
};

export const actualizar = async (id: number, data: {
  genero_id: number;
  persona_cedula: string;
  persona_primer_nombre: string;
  persona_segundo_nombre?: string | null;
  persona_primer_apellido: string;
  persona_segundo_apellido?: string | null;
  persona_fecha_nacimiento?: string;
  persona_direccion: string;
  persona_telefono: string;
  persona_correo: string;
  persona_estado: string;
}) => {
  return prisma.tbl_persona.update({
    where: { persona_id: id },
    data: {
      ...data,
      persona_fecha_nacimiento: data.persona_fecha_nacimiento ? new Date(data.persona_fecha_nacimiento) : undefined,
      persona_segundo_nombre: data.persona_segundo_nombre || null,
      persona_segundo_apellido: data.persona_segundo_apellido || null,
    },
  });
};

export const eliminar = async (id: number) => {
  return prisma.tbl_persona.update({ where: { persona_id: id }, data: { persona_estado: "I" } });
};
