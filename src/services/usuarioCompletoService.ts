import prisma from "../config/prisma";
import bcrypt from "bcryptjs";

const usuarioCompletoSelect = {
  usuario_id: true,
  usuario_nombre: true,
  usuario_imagen: true,
  usuario_estado: true,
  persona: true,
  perfiles: {
    where: { perfil_estado: "A" as const },
    include: { rol: true },
  },
};

export const listar = async () => {
  return prisma.tbl_usuario.findMany({ select: usuarioCompletoSelect });
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
  usuario_nombre: string;
  usuario_contrasena: string;
  usuario_imagen?: string;
  rol_ids: number[];
}) => {
  const cedulaExistente = await prisma.tbl_persona.findUnique({
    where: { persona_cedula: data.persona_cedula },
  });
  if (cedulaExistente) throw new Error("Ya existe una persona con esa cédula");

  const usuarioExistente = await prisma.tbl_usuario.findUnique({
    where: { usuario_nombre: data.usuario_nombre },
  });
  if (usuarioExistente) throw new Error("Ese nombre de usuario ya está en uso");

  const hashedPassword = await bcrypt.hash(data.usuario_contrasena, 10);

  const usuarioId = await prisma.$transaction(async (tx) => {
    const persona = await tx.tbl_persona.create({
      data: {
        genero_id: data.genero_id,
        persona_cedula: data.persona_cedula,
        persona_primer_nombre: data.persona_primer_nombre,
        persona_segundo_nombre: data.persona_segundo_nombre || null,
        persona_primer_apellido: data.persona_primer_apellido,
        persona_segundo_apellido: data.persona_segundo_apellido || null,
        persona_fecha_nacimiento: new Date(data.persona_fecha_nacimiento),
        persona_direccion: data.persona_direccion,
        persona_telefono: data.persona_telefono,
        persona_correo: data.persona_correo,
        persona_estado: "A",
      },
    });

    const usuario = await tx.tbl_usuario.create({
      data: {
        persona_id: persona.persona_id,
        usuario_nombre: data.usuario_nombre,
        usuario_contrasena: hashedPassword,
        usuario_imagen: data.usuario_imagen || "default.png",
        usuario_estado: "A",
      },
    });

    if (Array.isArray(data.rol_ids) && data.rol_ids.length > 0) {
      await tx.tbl_perfil.createMany({
        data: data.rol_ids.map((rol_id) => ({
          usuario_id: usuario.usuario_id,
          rol_id,
          perfil_estado: "A",
        })),
      });
    }

    return usuario.usuario_id;
  });

  return prisma.tbl_usuario.findUnique({
    where: { usuario_id: usuarioId },
    select: usuarioCompletoSelect,
  });
};

export const actualizar = async (id: number, data: {
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
  usuario_nombre: string;
  usuario_contrasena?: string;
  usuario_imagen: string;
  usuario_estado: string;
  rol_ids: number[];
}) => {
  const usuarioActual = await prisma.tbl_usuario.findUnique({
    where: { usuario_id: id },
  });
  if (!usuarioActual) throw new Error("Usuario no encontrado");

  await prisma.$transaction(async (tx) => {
    await tx.tbl_persona.update({
      where: { persona_id: usuarioActual.persona_id },
      data: {
        genero_id: data.genero_id,
        persona_cedula: data.persona_cedula,
        persona_primer_nombre: data.persona_primer_nombre,
        persona_segundo_nombre: data.persona_segundo_nombre || null,
        persona_primer_apellido: data.persona_primer_apellido,
        persona_segundo_apellido: data.persona_segundo_apellido || null,
        persona_fecha_nacimiento: new Date(data.persona_fecha_nacimiento),
        persona_direccion: data.persona_direccion,
        persona_telefono: data.persona_telefono,
        persona_correo: data.persona_correo,
      },
    });

    const usuarioData: Record<string, unknown> = {
      usuario_nombre: data.usuario_nombre,
      usuario_imagen: data.usuario_imagen,
      usuario_estado: data.usuario_estado,
    };
    if (data.usuario_contrasena) {
      usuarioData.usuario_contrasena = await bcrypt.hash(data.usuario_contrasena, 10);
    }

    await tx.tbl_usuario.update({
      where: { usuario_id: id },
      data: usuarioData,
    });

    await tx.tbl_perfil.deleteMany({ where: { usuario_id: id } });
    if (Array.isArray(data.rol_ids) && data.rol_ids.length > 0) {
      await tx.tbl_perfil.createMany({
        data: data.rol_ids.map((rol_id) => ({
          usuario_id: id,
          rol_id,
          perfil_estado: "A",
        })),
      });
    }
  });

  return prisma.tbl_usuario.findUnique({
    where: { usuario_id: id },
    select: usuarioCompletoSelect,
  });
};

export const eliminar = async (id: number) => {
  return prisma.tbl_usuario.update({
    where: { usuario_id: id },
    data: { usuario_estado: "I" },
  });
};
