import { Request, Response } from "express";
import prisma from "../../config/prisma";
import { getPagination, paginatedResponse } from "../../utils/pagination";
import { buildEstadoFilter, buildIntFilter } from "../../utils/filters";

// GET /api/historias-clinicas
export const getHistoriasClinicas = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPagination(req.query as { page?: string; limit?: string });
    const { historia_clinica_estado, paciente_id } = req.query as Record<string, string>;

    const where: Record<string, unknown> = {};
    const estadoFilter = buildEstadoFilter(historia_clinica_estado);
    if (estadoFilter) where.historia_clinica_estado = estadoFilter;
    const pacienteFilter = buildIntFilter(paciente_id);
    if (pacienteFilter) where.paciente_id = pacienteFilter;

    const [historias, total] = await Promise.all([
      prisma.tbl_historia_clinica.findMany({ where, skip, take: limit }),
      prisma.tbl_historia_clinica.count({ where }),
    ]);

    res.json(paginatedResponse(historias, total, page, limit));
  } catch (error) {
    res.status(500).json({ error: "Error al obtener historias clínicas" });
  }
};

// GET /api/historias-clinicas/:id
export const getHistoriaClinicaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const historia = await prisma.tbl_historia_clinica.findUnique({
      where: { historia_clinica_id: Number(id) },
    });
    if (!historia) {
      res.status(404).json({ error: "Historia clínica no encontrada" });
      return;
    }
    res.json(historia);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la historia clínica" });
  }
};

// POST /api/historias-clinicas
export const createHistoriaClinica = async (req: Request, res: Response) => {
  try {
    const {
      paciente_id,
      historia_clinica_numero,
      historia_clinica_fecha_apertura,
      historia_clinica_estado,
    } = req.body;

    const historia = await prisma.tbl_historia_clinica.create({
      data: {
        paciente_id,
        historia_clinica_numero,
        historia_clinica_fecha_apertura: new Date(historia_clinica_fecha_apertura),
        historia_clinica_estado,
      },
    });
    res.status(201).json(historia);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la historia clínica" });
  }
};

// PUT /api/historias-clinicas/:id
export const updateHistoriaClinica = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      paciente_id,
      historia_clinica_numero,
      historia_clinica_fecha_apertura,
      historia_clinica_estado,
    } = req.body;

    const historia = await prisma.tbl_historia_clinica.update({
      where: { historia_clinica_id: Number(id) },
      data: {
        paciente_id,
        historia_clinica_numero,
        historia_clinica_fecha_apertura: historia_clinica_fecha_apertura
          ? new Date(historia_clinica_fecha_apertura)
          : undefined,
        historia_clinica_estado,
      },
    });
    res.json(historia);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la historia clínica" });
  }
};

// DELETE /api/historias-clinicas/:id (borrado lógico)
export const deleteHistoriaClinica = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const historia = await prisma.tbl_historia_clinica.update({
      where: { historia_clinica_id: Number(id) },
      data: { historia_clinica_estado: "I" },
    });
    res.json({ message: "Historia clínica desactivada correctamente", historia });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar la historia clínica" });
  }
};