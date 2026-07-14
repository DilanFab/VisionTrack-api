import { Request, Response } from "express";
import prisma from "../../config/prisma";
import { getPagination, paginatedResponse } from "../../utils/pagination";
import { buildSearchFilter } from "../../utils/filters";

// GET /api/personas
export const getPersonas = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPagination(req.query as { page?: string; limit?: string });
    const { search } = req.query as Record<string, string>;

    const where: Record<string, unknown> = {};
    const searchFilters = buildSearchFilter(search, [
      "persona_primer_nombre",
      "persona_primer_apellido",
      "persona_cedula",
      "persona_correo",
    ]);
    if (searchFilters) where.OR = searchFilters;

    const [personas, total] = await Promise.all([
      prisma.tbl_persona.findMany({ where, skip, take: limit }),
      prisma.tbl_persona.count({ where }),
    ]);

    res.json(paginatedResponse(personas, total, page, limit));
  } catch (error) {
    res.status(500).json({ error: "Error al obtener personas" });
  }
};

// GET /api/personas/:id
export const getPersonaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const persona = await prisma.tbl_persona.findUnique({
      where: { persona_id: Number(id) },
    });
    if (!persona) {
      res.status(404).json({ error: "Persona no encontrada" });
      return;
    }
    res.json(persona);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la persona" });
  }
};

// POST /api/personas
export const createPersona = async (req: Request, res: Response) => {
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
      persona_estado,
    } = req.body;

    const persona = await prisma.tbl_persona.create({
      data: {
        genero_id,
        persona_cedula,
        persona_primer_nombre,
        persona_segundo_nombre,
        persona_primer_apellido,
        persona_segundo_apellido,
        persona_fecha_nacimiento: new Date(persona_fecha_nacimiento),
        persona_direccion,
        persona_telefono,
        persona_correo,
        persona_estado,
      },
    });
    res.status(201).json(persona);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la persona" });
  }
};

// PUT /api/personas/:id
export const updatePersona = async (req: Request, res: Response) => {
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
      persona_estado,
    } = req.body;

    const persona = await prisma.tbl_persona.update({
      where: { persona_id: Number(id) },
      data: {
        genero_id,
        persona_cedula,
        persona_primer_nombre,
        persona_segundo_nombre,
        persona_primer_apellido,
        persona_segundo_apellido,
        persona_fecha_nacimiento: persona_fecha_nacimiento
          ? new Date(persona_fecha_nacimiento)
          : undefined,
        persona_direccion,
        persona_telefono,
        persona_correo,
        persona_estado,
      },
    });
    res.json(persona);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la persona" });
  }
};

// DELETE /api/personas/:id (borrado lógico)
export const deletePersona = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const persona = await prisma.tbl_persona.update({
      where: { persona_id: Number(id) },
      data: { persona_estado: "I" },
    });
    res.json({ message: "Persona desactivada correctamente", persona });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar la persona" });
  }
};