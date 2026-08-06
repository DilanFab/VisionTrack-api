import prisma from "../config/prisma";

export const listar = async () => {
  return prisma.tbl_genero.findMany();
};

export const obtenerPorId = async (id: number) => {
  return prisma.tbl_genero.findUnique({ where: { genero_id: id } });
};

export const crear = async (data: { genero_nombre: string; genero_estado: string }) => {
  return prisma.tbl_genero.create({ data });
};

export const actualizar = async (id: number, data: { genero_nombre: string; genero_estado: string }) => {
  return prisma.tbl_genero.update({ where: { genero_id: id }, data });
};

export const eliminar = async (id: number) => {
  return prisma.tbl_genero.update({ where: { genero_id: id }, data: { genero_estado: "I" } });
};
