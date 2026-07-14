import { Request, Response } from "express";
import * as citaService from "../../services/citaService";

export { existeConflictoDeHorario } from "../../services/citaService";

export const getCitas = async (req: Request, res: Response) => {
  try {
    const result = await citaService.listar(req.query as any);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener citas" });
  }
};

export const getCitaById = async (req: Request, res: Response) => {
  try {
    const cita = await citaService.obtenerPorId(Number(req.params.id));
    if (!cita) { res.status(404).json({ error: "Cita no encontrada" }); return; }
    res.json(cita);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la cita" });
  }
};

export const createCita = async (req: Request, res: Response) => {
  try {
    const cita = await citaService.crear(req.body);
    res.status(201).json(cita);
  } catch (error: any) {
    if (error.message?.includes("conflict")) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Error al crear la cita" });
  }
};

export const updateCita = async (req: Request, res: Response) => {
  try {
    const cita = await citaService.actualizar(Number(req.params.id), req.body);
    res.json(cita);
  } catch (error: any) {
    if (error.message?.includes("conflict")) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Error al actualizar la cita" });
  }
};

export const deleteCita = async (req: Request, res: Response) => {
  try {
    const cita = await citaService.cancelar(Number(req.params.id));
    res.json({ message: "Cita cancelada correctamente", cita });
  } catch (error) {
    res.status(500).json({ error: "Error al cancelar la cita" });
  }
};
