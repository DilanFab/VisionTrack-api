import prisma from "../config/prisma";
import { getPagination, paginatedResponse } from "../utils/pagination";
import { buildEstadoFilter } from "../utils/filters";
import bcrypt from "bcryptjs";

const SELECT = {
  usuario_id: true,
  persona_id: true,
  usuario_imagen: true,
  usuario_nombre: true,
  usuario_intentos: true,
  usuario_cambiar_contrasena: true,
  usuario_estado: true,
};

export const listar = async (query: { page?: string; limit?: string; usuario_estado?: string }) => {
  const { page, limit, skip } = getPagination(query);
  const where: Record<string, unknown> = {};
  const estadoFilter = buildEstadoFilter(query.usuario_estado);
  if (estadoFilter) where.usuario_estado = estadoFilter;

  const [usuarios, total] = await Promise.all([
    prisma.tbl_usuario.findMany({ where, select: SELECT, skip, take: limit }),
    prisma.tbl_usuario.count({ where }),
  ]);

  return paginatedResponse(usuarios, total, page, limit);
};

export const obtenerPorId = async (id: number) => {
  return prisma.tbl_usuario.findUnique({ where: { usuario_id: id }, select: SELECT });
};

export const crear = async (data: {
  persona_id: number;
  usuario_imagen: string;
  usuario_nombre: string;
  usuario_contrasena: string;
  usuario_estado: string;
}) => {
  const hashedPassword = await bcrypt.hash(data.usuario_contrasena, 10);
  return prisma.tbl_usuario.create({
    data: { ...data, usuario_contrasena: hashedPassword },
    select: SELECT,
  });
};

export const actualizar = async (id: number, data: {
  persona_id: number;
  usuario_imagen: string;
  usuario_nombre: string;
  usuario_contrasena?: string;
  usuario_intentos: number;
  usuario_cambiar_contrasena: number;
  usuario_estado: string;
}) => {
  const updateData: Record<string, unknown> = {
    persona_id: data.persona_id,
    usuario_imagen: data.usuario_imagen,
    usuario_nombre: data.usuario_nombre,
    usuario_intentos: data.usuario_intentos,
    usuario_cambiar_contrasena: data.usuario_cambiar_contrasena,
    usuario_estado: data.usuario_estado,
  };
  if (data.usuario_contrasena) {
    updateData.usuario_contrasena = await bcrypt.hash(data.usuario_contrasena, 10);
  }
  return prisma.tbl_usuario.update({ where: { usuario_id: id }, data: updateData, select: SELECT });
};

export const eliminar = async (id: number) => {
  return prisma.tbl_usuario.update({
    where: { usuario_id: id },
    data: { usuario_estado: "I" },
    select: { usuario_id: true, usuario_nombre: true, usuario_estado: true },
  });
};

export const obtenerPerfilPaciente = async (usuarioId: number) => {
  return prisma.tbl_perfil.findFirst({
    where: { usuario_id: usuarioId, rol: { rol_nombre: "Paciente" }, perfil_estado: "A" },
  });
};

export const obtenerHistoriaClinica = async (perfilId: number) => {
  return prisma.tbl_historia_clinica.findFirst({
    where: { paciente_id: perfilId, historia_clinica_estado: "A" },
  });
};
