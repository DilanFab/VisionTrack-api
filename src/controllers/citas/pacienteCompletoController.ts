import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { getPagination, paginatedResponse } from "../../utils/pagination";
import { buildSearchFilter } from "../../utils/filters";

const ROL_PACIENTE = "Paciente";
const PREFIJO_HISTORIA_CLINICA = "HC-";

// Genera el siguiente número correlativo con formato HC-000 a partir del
// mayor número existente (nunca hardcodeado).
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

// GET /api/pacientes-completos
export const getPacientesCompletos = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPagination(req.query as { page?: string; limit?: string });
    const { search } = req.query as Record<string, string>;

    const where: Record<string, unknown> = {};
    const searchFilters = buildSearchFilter(search, [
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

    res.json(paginatedResponse(pacientes, total, page, limit));
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los pacientes" });
  }
};

// POST /api/pacientes-completos
export const createPacienteCompleto = async (req: Request, res: Response) => {
  try {
    const {
      genero_id,
      persona_cedula,
      persona_primer_nombre,
      persona_segundo_nombre,
      persona_primer_apellido,
      persona_segundo_apellido,
      persona_fecha_nacimiento,
      persona_direccion,
      persona_telefono,
      persona_correo,
      usuario_nombre,
      usuario_contrasena,
      usuario_imagen,
    } = req.body;

    const cedulaExistente = await prisma.tbl_persona.findUnique({
      where: { persona_cedula },
    });
    if (cedulaExistente) {
      res.status(400).json({ error: "Ya existe una persona con esa cédula" });
      return;
    }

    const usuarioExistente = await prisma.tbl_usuario.findUnique({
      where: { usuario_nombre },
    });
    if (usuarioExistente) {
      res.status(400).json({ error: "Ese nombre de usuario ya está en uso" });
      return;
    }

    const rolPaciente = await prisma.tbl_rol.findUnique({ where: { rol_nombre: ROL_PACIENTE } });
    if (!rolPaciente) {
      res.status(500).json({ error: "No se encontró el rol Paciente" });
      return;
    }

    const hashedPassword = await bcrypt.hash(usuario_contrasena, 10);

    const historiaClinicaId = await prisma.$transaction(async (tx) => {
      const persona = await tx.tbl_persona.create({
        data: {
          genero_id: Number(genero_id),
          persona_cedula,
          persona_primer_nombre,
          persona_segundo_nombre: persona_segundo_nombre || null,
          persona_primer_apellido,
          persona_segundo_apellido: persona_segundo_apellido || null,
          persona_fecha_nacimiento: new Date(persona_fecha_nacimiento),
          persona_direccion,
          persona_telefono,
          persona_correo,
          persona_estado: "A",
        },
      });

      const usuario = await tx.tbl_usuario.create({
        data: {
          persona_id: persona.persona_id,
          usuario_nombre,
          usuario_contrasena: hashedPassword,
          usuario_imagen: usuario_imagen || "default.png",
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

    const pacienteCreado = await prisma.tbl_historia_clinica.findUnique({
      where: { historia_clinica_id: historiaClinicaId },
      include: pacienteCompletoInclude,
    });
    res.status(201).json(pacienteCreado);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el paciente" });
  }
};

// PUT /api/pacientes-completos/:id  (id = historia_clinica_id)
export const updatePacienteCompleto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      genero_id,
      persona_cedula,
      persona_primer_nombre,
      persona_segundo_nombre,
      persona_primer_apellido,
      persona_segundo_apellido,
      persona_fecha_nacimiento,
      persona_direccion,
      persona_telefono,
      persona_correo,
      usuario_nombre,
      usuario_contrasena,
      usuario_imagen,
      historia_clinica_estado,
    } = req.body;

    const pacienteActual = await prisma.tbl_historia_clinica.findUnique({
      where: { historia_clinica_id: Number(id) },
      include: { perfil: { include: { usuario: true } } },
    });
    if (!pacienteActual) {
      res.status(404).json({ error: "Paciente no encontrado" });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.tbl_persona.update({
        where: { persona_id: pacienteActual.perfil.usuario.persona_id },
        data: {
          genero_id: Number(genero_id),
          persona_cedula,
          persona_primer_nombre,
          persona_segundo_nombre: persona_segundo_nombre || null,
          persona_primer_apellido,
          persona_segundo_apellido: persona_segundo_apellido || null,
          persona_fecha_nacimiento: new Date(persona_fecha_nacimiento),
          persona_direccion,
          persona_telefono,
          persona_correo,
        },
      });

      const usuarioData: Record<string, unknown> = {
        usuario_nombre,
        usuario_imagen,
      };
      if (usuario_contrasena) {
        usuarioData.usuario_contrasena = await bcrypt.hash(usuario_contrasena, 10);
      }

      await tx.tbl_usuario.update({
        where: { usuario_id: pacienteActual.perfil.usuario_id },
        data: usuarioData,
      });

      await tx.tbl_historia_clinica.update({
        where: { historia_clinica_id: Number(id) },
        data: { historia_clinica_estado },
      });
    });

    const pacienteActualizado = await prisma.tbl_historia_clinica.findUnique({
      where: { historia_clinica_id: Number(id) },
      include: pacienteCompletoInclude,
    });
    res.json(pacienteActualizado);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el paciente" });
  }
};

// DELETE /api/pacientes-completos/:id (borrado lógico de la historia clínica)
export const deletePacienteCompleto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const historia = await prisma.tbl_historia_clinica.update({
      where: { historia_clinica_id: Number(id) },
      data: { historia_clinica_estado: "I" },
    });
    res.json({ message: "Paciente desactivado correctamente", historia });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el paciente" });
  }
};
