import prisma from "../config/prisma";

export const listar = async () => {
  return prisma.tbl_permiso.findMany();
};

export const obtenerPorId = async (id: number) => {
  return prisma.tbl_permiso.findUnique({ where: { permiso_id: id } });
};

export const crear = async (data: { rol_id: number; menu_id: number; permiso_estado: string }) => {
  return prisma.tbl_permiso.create({ data });
};

export const actualizar = async (id: number, data: { rol_id: number; menu_id: number; permiso_estado: string }) => {
  return prisma.tbl_permiso.update({ where: { permiso_id: id }, data });
};

export const eliminar = async (id: number) => {
  return prisma.tbl_permiso.update({ where: { permiso_id: id }, data: { permiso_estado: "I" } });
};

export const reemplazarPermisosDeRol = async (rolId: number, menuIds: number[]) => {
  return prisma.$transaction(async (tx) => {
    await tx.tbl_permiso.deleteMany({ where: { rol_id: rolId } });
    if (Array.isArray(menuIds) && menuIds.length > 0) {
      await tx.tbl_permiso.createMany({
        data: menuIds.map((menu_id) => ({ rol_id: rolId, menu_id })),
      });
    }
    return tx.tbl_permiso.findMany({ where: { rol_id: rolId } });
  });
};
