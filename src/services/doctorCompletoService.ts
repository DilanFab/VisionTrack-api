import prisma from "../config/prisma";
import bcrypt from "bcryptjs";

const ROL_MEDICO = "Médico";

const doctorCompletoInclude = {
  especialidad_medica: true,
  perfil: {
    include: {
      usuario: {
        include: { persona: true },
      },
    },
  },
};

export const listar = async () => {
  return prisma.tbl_doctor.findMany({ include: doctorCompletoInclude });
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
  especialidad_medica_id: number;
}) => {
  const cedulaExistente = await prisma.tbl_persona.findUnique({
    where: { persona_cedula: data.persona_cedula },
  });
  if (cedulaExistente) throw new Error("Ya existe una persona con esa cédula");

  const usuarioExistente = await prisma.tbl_usuario.findUnique({
    where: { usuario_nombre: data.usuario_nombre },
  });
  if (usuarioExistente) throw new Error("Ese nombre de usuario ya está en uso");

  const rolMedico = await prisma.tbl_rol.findUnique({ where: { rol_nombre: ROL_MEDICO } });
  if (!rolMedico) throw new Error("No se encontró el rol Médico");

  const hashedPassword = await bcrypt.hash(data.usuario_contrasena, 10);

  const doctorId = await prisma.$transaction(async (tx) => {
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

    const perfil = await tx.tbl_perfil.create({
      data: {
        usuario_id: usuario.usuario_id,
        rol_id: rolMedico.rol_id,
        perfil_estado: "A",
      },
    });

    const doctor = await tx.tbl_doctor.create({
      data: {
        perfil_id: perfil.perfil_id,
        especialidad_medica_id: data.especialidad_medica_id,
        doctor_estado: "A",
      },
    });

    return doctor.doctor_id;
  });

  return prisma.tbl_doctor.findUnique({
    where: { doctor_id: doctorId },
    include: doctorCompletoInclude,
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
  especialidad_medica_id: number;
  doctor_estado: string;
}) => {
  const doctorActual = await prisma.tbl_doctor.findUnique({
    where: { doctor_id: id },
    include: { perfil: { include: { usuario: true } } },
  });
  if (!doctorActual) throw new Error("Doctor no encontrado");

  await prisma.$transaction(async (tx) => {
    await tx.tbl_persona.update({
      where: { persona_id: doctorActual.perfil.usuario.persona_id },
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
    };
    if (data.usuario_contrasena) {
      usuarioData.usuario_contrasena = await bcrypt.hash(data.usuario_contrasena, 10);
    }

    await tx.tbl_usuario.update({
      where: { usuario_id: doctorActual.perfil.usuario_id },
      data: usuarioData,
    });

    await tx.tbl_doctor.update({
      where: { doctor_id: id },
      data: {
        especialidad_medica_id: data.especialidad_medica_id,
        doctor_estado: data.doctor_estado,
      },
    });
  });

  return prisma.tbl_doctor.findUnique({
    where: { doctor_id: id },
    include: doctorCompletoInclude,
  });
};

export const eliminar = async (id: number) => {
  return prisma.tbl_doctor.update({
    where: { doctor_id: id },
    data: { doctor_estado: "I" },
  });
};
