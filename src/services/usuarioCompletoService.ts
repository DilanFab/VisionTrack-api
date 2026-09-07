import prisma from "../config/prisma";
import bcrypt from "bcryptjs";

const isMedicoRole = (nombre: string) =>
  nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === "medico";

const isPacienteRole = (nombre: string) =>
  nombre.toLowerCase() === "paciente";

const usuarioCompletoSelect = {
  usuario_id: true,
  usuario_nombre: true,
  usuario_imagen: true,
  usuario_estado: true,
  persona: {
    include: {
      genero: true,
    },
  },
  perfiles: {
    where: { perfil_estado: "A" as const },
    include: {
      rol: true,
      doctor: {
        include: {
          especialidad_medica: true,
        },
      },
      historias_clinicas: true,
    },
  },
};

export const listar = async () => {
  return prisma.tbl_usuario.findMany({ select: usuarioCompletoSelect, orderBy: { usuario_id: "desc" } });
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
  especialidad_medica_id?: number;
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
      const roles = await tx.tbl_rol.findMany({
        where: { rol_id: { in: data.rol_ids } },
      });

      for (const rol of roles) {
        const perfil = await tx.tbl_perfil.create({
          data: {
            usuario_id: usuario.usuario_id,
            rol_id: rol.rol_id,
            perfil_estado: "A",
          },
        });

        // Automatización 1: si es Médico -> crear tbl_doctor
        if (isMedicoRole(rol.rol_nombre)) {
          let espId = data.especialidad_medica_id;
          if (!espId) {
            const defaultEsp = await tx.tbl_especialidad_medica.findFirst({
              where: { especialidad_medica_estado: "A" },
            });
            espId = defaultEsp?.especialidad_medica_id || 1;
          }
          await tx.tbl_doctor.create({
            data: {
              perfil_id: perfil.perfil_id,
              especialidad_medica_id: Number(espId),
              doctor_estado: "A",
            },
          });
        }

        // Automatización 2: si es Paciente -> crear tbl_historia_clinica
        if (isPacienteRole(rol.rol_nombre)) {
          let numeroHc = `HC-${data.persona_cedula}`;
          const existeNumero = await tx.tbl_historia_clinica.findUnique({
            where: { historia_clinica_numero: numeroHc },
          });
          if (existeNumero) {
            numeroHc = `HC-${perfil.perfil_id}-${Date.now().toString().slice(-4)}`;
          }
          await tx.tbl_historia_clinica.create({
            data: {
              paciente_id: perfil.perfil_id,
              historia_clinica_numero: numeroHc,
              historia_clinica_fecha_apertura: new Date(),
              historia_clinica_estado: "A",
            },
          });
        }
      }
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
  especialidad_medica_id?: number;
}) => {
  const usuarioActual = await prisma.tbl_usuario.findUnique({
    where: { usuario_id: id },
    include: { persona: true },
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

    // Reconciliación segura de roles (evitar cascade delete destructivo)
    const perfilesExistentes = await tx.tbl_perfil.findMany({
      where: { usuario_id: id },
      include: { rol: true, doctor: true, historias_clinicas: true },
    });

    const rolesDeseados = Array.isArray(data.rol_ids) ? data.rol_ids : [];
    const rolesInfo = await tx.tbl_rol.findMany({
      where: { rol_id: { in: rolesDeseados } },
    });
    const rolesMap = new Map(rolesInfo.map((r) => [r.rol_id, r]));

    // Activar o crear perfiles deseados
    for (const rolId of rolesDeseados) {
      const perfilExistente = perfilesExistentes.find((p) => p.rol_id === rolId);
      const rol = rolesMap.get(rolId);
      if (!rol) continue;

      let perfilId: number;
      if (perfilExistente) {
        perfilId = perfilExistente.perfil_id;
        if (perfilExistente.perfil_estado !== "A") {
          await tx.tbl_perfil.update({
            where: { perfil_id: perfilId },
            data: { perfil_estado: "A" },
          });
        }
      } else {
        const nuevoPerfil = await tx.tbl_perfil.create({
          data: {
            usuario_id: id,
            rol_id: rolId,
            perfil_estado: "A",
          },
        });
        perfilId = nuevoPerfil.perfil_id;
      }

      // Asegurar doctor si es rol Médico
      if (isMedicoRole(rol.rol_nombre)) {
        let espId = data.especialidad_medica_id;
        if (!espId) {
          const defaultEsp = await tx.tbl_especialidad_medica.findFirst({
            where: { especialidad_medica_estado: "A" },
          });
          espId = defaultEsp?.especialidad_medica_id || 1;
        }

        const docExistente = perfilExistente?.doctor || await tx.tbl_doctor.findUnique({ where: { perfil_id: perfilId } });
        if (docExistente) {
          await tx.tbl_doctor.update({
            where: { doctor_id: docExistente.doctor_id },
            data: {
              especialidad_medica_id: Number(espId),
              doctor_estado: "A",
            },
          });
        } else {
          await tx.tbl_doctor.create({
            data: {
              perfil_id: perfilId,
              especialidad_medica_id: Number(espId),
              doctor_estado: "A",
            },
          });
        }
      }

      // Asegurar historia clínica si es rol Paciente
      if (isPacienteRole(rol.rol_nombre)) {
        const hcExistente = perfilExistente?.historias_clinicas?.[0] || await tx.tbl_historia_clinica.findFirst({
          where: { paciente_id: perfilId, historia_clinica_estado: "A" },
        });

        if (!hcExistente) {
          let numeroHc = `HC-${data.persona_cedula}`;
          const existeNumero = await tx.tbl_historia_clinica.findUnique({
            where: { historia_clinica_numero: numeroHc },
          });
          if (existeNumero) {
            numeroHc = `HC-${perfilId}-${Date.now().toString().slice(-4)}`;
          }
          await tx.tbl_historia_clinica.create({
            data: {
              paciente_id: perfilId,
              historia_clinica_numero: numeroHc,
              historia_clinica_fecha_apertura: new Date(),
              historia_clinica_estado: "A",
            },
          });
        }
      }
    }

    // Desactivar perfiles que ya no están seleccionados
    for (const perfil of perfilesExistentes) {
      if (!rolesDeseados.includes(perfil.rol_id) && perfil.perfil_estado === "A") {
        await tx.tbl_perfil.update({
          where: { perfil_id: perfil.perfil_id },
          data: { perfil_estado: "I" },
        });
        if (perfil.doctor) {
          await tx.tbl_doctor.update({
            where: { doctor_id: perfil.doctor.doctor_id },
            data: { doctor_estado: "I" },
          });
        }
      }
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
