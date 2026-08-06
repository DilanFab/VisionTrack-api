import prisma from "../config/prisma";

export const listar = async () => {
  return prisma.tbl_perfil.findMany();
};

export const obtenerPorId = async (id: number) => {
  return prisma.tbl_perfil.findUnique({ where: { perfil_id: id } });
};

export const crear = async (data: { usuario_id: number; rol_id: number; perfil_estado: string }) => {
  return prisma.tbl_perfil.create({ data });
};

export const actualizar = async (id: number, data: { usuario_id: number; rol_id: number; perfil_estado: string }) => {
  return prisma.tbl_perfil.update({ where: { perfil_id: id }, data });
};

export const eliminar = async (id: number) => {
  return prisma.tbl_perfil.update({ where: { perfil_id: id }, data: { perfil_estado: "I" } });
};
