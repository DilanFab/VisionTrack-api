import { Request, Response } from "express";
import prisma from "../../config/prisma";

// GET /api/especialidades-medicas
export const getEspecialidadesMedicas = async (req: Request, res: Response) => {
  try {
    const especialidades = await prisma.tbl_especialidad_medica.findMany();
    res.json(especialidades);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener especialidades médicas" });
  }
};

// GET /api/especialidades-medicas/:id
export const getEspecialidadMedicaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const especialidad = await prisma.tbl_especialidad_medica.findUnique({
      where: { especialidad_medica_id: Number(id) },
    });
    if (!especialidad) {
      res.status(404).json({ error: "Especialidad médica no encontrada" });
      return;
    }
    res.json(especialidad);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la especialidad médica" });
  }
};

// POST /api/especialidades-medicas
export const createEspecialidadMedica = async (req: Request, res: Response) => {
  try {
    const { especialidad_medica_nombre, especialidad_medica_descripcion, especialidad_medica_estado } = req.body;
    const especialidad = await prisma.tbl_especialidad_medica.create({
      data: { especialidad_medica_nombre, especialidad_medica_descripcion, especialidad_medica_estado },
    });
    res.status(201).json(especialidad);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la especialidad médica" });
  }
};

// PUT /api/especialidades-medicas/:id
export const updateEspecialidadMedica = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { especialidad_medica_nombre, especialidad_medica_descripcion, especialidad_medica_estado } = req.body;
    const especialidad = await prisma.tbl_especialidad_medica.update({
      where: { especialidad_medica_id: Number(id) },
      data: { especialidad_medica_nombre, especialidad_medica_descripcion, especialidad_medica_estado },
    });
    res.json(especialidad);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la especialidad médica" });
  }
};

// DELETE /api/especialidades-medicas/:id (borrado lógico)
export const deleteEspecialidadMedica = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const especialidad = await prisma.tbl_especialidad_medica.update({
      where: { especialidad_medica_id: Number(id) },
      data: { especialidad_medica_estado: "I" },
    });
    res.json({ message: "Especialidad médica desactivada correctamente", especialidad });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar la especialidad médica" });
  }
};