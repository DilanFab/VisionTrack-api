import prisma from "../config/prisma";

export const listar = async () => {
  return prisma.tbl_especialidad_medica.findMany();
};

export const obtenerPorId = async (id: number) => {
  return prisma.tbl_especialidad_medica.findUnique({ where: { especialidad_medica_id: id } });
};

export const crear = async (data: { especialidad_medica_nombre: string; especialidad_medica_descripcion: string; especialidad_medica_estado: string }) => {
  return prisma.tbl_especialidad_medica.create({ data });
};

export const actualizar = async (id: number, data: { especialidad_medica_nombre: string; especialidad_medica_descripcion: string; especialidad_medica_estado: string }) => {
  return prisma.tbl_especialidad_medica.update({ where: { especialidad_medica_id: id }, data });
};

export const eliminar = async (id: number) => {
  return prisma.tbl_especialidad_medica.update({ where: { especialidad_medica_id: id }, data: { especialidad_medica_estado: "I" } });
};
