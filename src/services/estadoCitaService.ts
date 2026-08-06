import prisma from "../config/prisma";

export const listar = async () => {
  return prisma.tbl_estado_cita.findMany();
};

export const obtenerPorId = async (id: number) => {
  return prisma.tbl_estado_cita.findUnique({ where: { estado_cita_id: id } });
};

export const crear = async (data: { estado_cita_nombre: string; estado_cita_descripcion: string; estado_cita_estado: string }) => {
  return prisma.tbl_estado_cita.create({ data });
};

export const actualizar = async (id: number, data: { estado_cita_nombre: string; estado_cita_descripcion: string; estado_cita_estado: string }) => {
  return prisma.tbl_estado_cita.update({ where: { estado_cita_id: id }, data });
};

export const eliminar = async (id: number) => {
  return prisma.tbl_estado_cita.update({ where: { estado_cita_id: id }, data: { estado_cita_estado: "I" } });
};
