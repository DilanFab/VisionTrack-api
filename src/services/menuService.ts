import prisma from "../config/prisma";

export const listar = async () => {
  return prisma.tbl_menu.findMany({ orderBy: { menu_id: "asc" } });
};

export const obtenerPorId = async (id: number) => {
  return prisma.tbl_menu.findUnique({ where: { menu_id: id }, include: { hijos: true } });
};

export const crear = async (data: { menu_padre?: number | null; menu_nombre: string; menu_icono: string; menu_referencia: string; menu_estado: string }) => {
  return prisma.tbl_menu.create({
    data: {
      menu_padre: data.menu_padre ?? null,
      menu_nombre: data.menu_nombre,
      menu_icono: data.menu_icono,
      menu_referencia: data.menu_referencia,
      menu_estado: data.menu_estado,
    },
  });
};

export const actualizar = async (id: number, data: { menu_padre?: number; menu_nombre: string; menu_icono: string; menu_referencia: string; menu_estado: string }) => {
  return prisma.tbl_menu.update({ where: { menu_id: id }, data });
};

export const eliminar = async (id: number) => {
  return prisma.tbl_menu.update({ where: { menu_id: id }, data: { menu_estado: "I" } });
};
