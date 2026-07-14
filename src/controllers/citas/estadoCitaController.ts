import { Request, Response } from "express";
import * as estadoCitaService from "../../services/estadoCitaService";

export const getEstadosCita = async (_req: Request, res: Response) => {
  try {
    const estados = await estadoCitaService.listar();
    res.json(estados);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener estados de cita" });
  }
};

export const getEstadoCitaById = async (req: Request, res: Response) => {
  try {
    const estado = await estadoCitaService.obtenerPorId(Number(req.params.id));
    if (!estado) { res.status(404).json({ error: "Estado de cita no encontrado" }); return; }
    res.json(estado);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el estado de cita" });
  }
};

export const createEstadoCita = async (req: Request, res: Response) => {
  try {
    const estado = await estadoCitaService.crear(req.body);
    res.status(201).json(estado);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el estado de cita" });
  }
};

export const updateEstadoCita = async (req: Request, res: Response) => {
  try {
    const estado = await estadoCitaService.actualizar(Number(req.params.id), req.body);
    res.json(estado);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el estado de cita" });
  }
};

export const deleteEstadoCita = async (req: Request, res: Response) => {
  try {
    const estado = await estadoCitaService.eliminar(Number(req.params.id));
    res.json({ message: "Estado de cita desactivado correctamente", estado });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el estado de cita" });
  }
};
