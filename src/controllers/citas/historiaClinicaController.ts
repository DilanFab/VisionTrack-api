import { Request, Response } from "express";
import * as historiaClinicaService from "../../services/historiaClinicaService";

export const getHistoriasClinicas = async (req: Request, res: Response) => {
  try {
    const result = await historiaClinicaService.listar(req.query as any);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener historias clínicas" });
  }
};

export const getHistoriaClinicaById = async (req: Request, res: Response) => {
  try {
    const historia = await historiaClinicaService.obtenerPorId(Number(req.params.id));
    if (!historia) { res.status(404).json({ error: "Historia clínica no encontrada" }); return; }
    res.json(historia);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la historia clínica" });
  }
};

export const createHistoriaClinica = async (req: Request, res: Response) => {
  try {
    const historia = await historiaClinicaService.crear(req.body);
    res.status(201).json(historia);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la historia clínica" });
  }
};

export const updateHistoriaClinica = async (req: Request, res: Response) => {
  try {
    const historia = await historiaClinicaService.actualizar(Number(req.params.id), req.body);
    res.json(historia);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la historia clínica" });
  }
};

export const deleteHistoriaClinica = async (req: Request, res: Response) => {
  try {
    const historia = await historiaClinicaService.eliminar(Number(req.params.id));
    res.json({ message: "Historia clínica desactivada correctamente", historia });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar la historia clínica" });
  }
};
