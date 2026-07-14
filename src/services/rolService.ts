import prisma from "../config/prisma";

export const listar = async () => {
  return prisma.tbl_rol.findMany();
};

export const obtenerPorId = async (id: number) => {
  return prisma.tbl_rol.findUnique({ where: { rol_id: id } });
};

export const crear = async (data: { rol_nombre: string; rol_descripcion: string; rol_estado: string }) => {
  return prisma.tbl_rol.create({ data });
};

export const actualizar = async (id: number, data: { rol_nombre: string; rol_descripcion: string; rol_estado: string }) => {
  return prisma.tbl_rol.update({ where: { rol_id: id }, data });
};

export const eliminar = async (id: number) => {
  return prisma.tbl_rol.update({ where: { rol_id: id }, data: { rol_estado: "I" } });
};
