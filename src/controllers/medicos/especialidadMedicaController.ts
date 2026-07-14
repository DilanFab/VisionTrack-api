import { Request, Response } from "express";
import * as especialidadMedicaService from "../../services/especialidadMedicaService";

export const getEspecialidadesMedicas = async (_req: Request, res: Response) => {
  try {
    const especialidades = await especialidadMedicaService.listar();
    res.json(especialidades);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener especialidades médicas" });
  }
};

export const getEspecialidadMedicaById = async (req: Request, res: Response) => {
  try {
    const especialidad = await especialidadMedicaService.obtenerPorId(Number(req.params.id));
    if (!especialidad) { res.status(404).json({ error: "Especialidad médica no encontrada" }); return; }
    res.json(especialidad);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la especialidad médica" });
  }
};

export const createEspecialidadMedica = async (req: Request, res: Response) => {
  try {
    const especialidad = await especialidadMedicaService.crear(req.body);
    res.status(201).json(especialidad);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la especialidad médica" });
  }
};

export const updateEspecialidadMedica = async (req: Request, res: Response) => {
  try {
    const especialidad = await especialidadMedicaService.actualizar(Number(req.params.id), req.body);
    res.json(especialidad);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la especialidad médica" });
  }
};

export const deleteEspecialidadMedica = async (req: Request, res: Response) => {
  try {
    const especialidad = await especialidadMedicaService.eliminar(Number(req.params.id));
    res.json({ message: "Especialidad médica desactivada correctamente", especialidad });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar la especialidad médica" });
  }
};
