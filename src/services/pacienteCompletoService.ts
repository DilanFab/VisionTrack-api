import prisma from "../config/prisma";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { getPagination, paginatedResponse } from "../utils/pagination";
import { buildSearchFilter } from "../utils/filters";

const ROL_PACIENTE = "Paciente";
const PREFIJO_HISTORIA_CLINICA = "HC-";

const pacienteCompletoInclude = {
  perfil: {
    include: {
      rol: true,
      usuario: {
        include: { persona: true },
      },
    },
  },
};

const generarNumeroHistoriaClinica = async (tx: Prisma.TransactionClient) => {
  const historias = await tx.tbl_historia_clinica.findMany({
    select: { historia_clinica_numero: true },
  });

  let maxNumero = 0;
  for (const h of historias) {
    const match = h.historia_clinica_numero.match(/^HC-(\d+)$/);
    if (match) {
      const numero = parseInt(match[1], 10);
      if (numero > maxNumero) maxNumero = numero;
    }
  }

  return `${PREFIJO_HISTORIA_CLINICA}${String(maxNumero + 1).padStart(3, "0")}`;
};

export const listar = async (query: { page?: string; limit?: string; search?: string }) => {
  const { page, limit, skip } = getPagination(query);
  const where: Record<string, unknown> = {};
  const searchFilters = buildSearchFilter(query.search, [
    "persona_primer_nombre",
    "persona_primer_apellido",
    "persona_cedula",
  ]);
  if (searchFilters) {
    where.perfil = {
      usuario: {
        persona: { OR: searchFilters },
      },
    };
  }

  const [pacientes, total] = await Promise.all([
    prisma.tbl_historia_clinica.findMany({ where, include: pacienteCompletoInclude, skip, take: limit }),
    prisma.tbl_historia_clinica.count({ where }),
  ]);

  return paginatedResponse(pacientes, total, page, limit);
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
}) => {
  const cedulaExistente = await prisma.tbl_persona.findUnique({
    where: { persona_cedula: data.persona_cedula },
  });
  if (cedulaExistente) throw new Error("Ya existe una persona con esa cédula");

  const usuarioExistente = await prisma.tbl_usuario.findUnique({
    where: { usuario_nombre: data.usuario_nombre },
  });
  if (usuarioExistente) throw new Error("Ese nombre de usuario ya está en uso");

  const rolPaciente = await prisma.tbl_rol.findUnique({ where: { rol_nombre: ROL_PACIENTE } });
  if (!rolPaciente) throw new Error("No se encontró el rol Paciente");

  const hashedPassword = await bcrypt.hash(data.usuario_contrasena, 10);

  const historiaClinicaId = await prisma.$transaction(async (tx) => {
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
        rol_id: rolPaciente.rol_id,
        perfil_estado: "A",
      },
    });

    const historiaClinicaNumero = await generarNumeroHistoriaClinica(tx);

    const historiaClinica = await tx.tbl_historia_clinica.create({
      data: {
        paciente_id: perfil.perfil_id,
        historia_clinica_numero: historiaClinicaNumero,
        historia_clinica_fecha_apertura: new Date(),
        historia_clinica_estado: "A",
      },
    });

    return historiaClinica.historia_clinica_id;
  });

  return prisma.tbl_historia_clinica.findUnique({
    where: { historia_clinica_id: historiaClinicaId },
    include: pacienteCompletoInclude,
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
  historia_clinica_estado: string;
}) => {
  const pacienteActual = await prisma.tbl_historia_clinica.findUnique({
    where: { historia_clinica_id: id },
    include: { perfil: { include: { usuario: true } } },
  });
  if (!pacienteActual) throw new Error("Paciente no encontrado");

  await prisma.$transaction(async (tx) => {
    await tx.tbl_persona.update({
      where: { persona_id: pacienteActual.perfil.usuario.persona_id },
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
      where: { usuario_id: pacienteActual.perfil.usuario_id },
      data: usuarioData,
    });

    await tx.tbl_historia_clinica.update({
      where: { historia_clinica_id: id },
      data: { historia_clinica_estado: data.historia_clinica_estado },
    });
  });

  return prisma.tbl_historia_clinica.findUnique({
    where: { historia_clinica_id: id },
    include: pacienteCompletoInclude,
  });
};

export const eliminar = async (id: number) => {
  return prisma.tbl_historia_clinica.update({
    where: { historia_clinica_id: id },
    data: { historia_clinica_estado: "I" },
  });
};
