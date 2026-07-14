import { Request, Response } from "express";
import * as pacienteCompletoService from "../../services/pacienteCompletoService";

export const getPacientesCompletos = async (req: Request, res: Response) => {
  try {
    const result = await pacienteCompletoService.listar(req.query as any);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los pacientes" });
  }
};

export const createPacienteCompleto = async (req: Request, res: Response) => {
  try {
    const paciente = await pacienteCompletoService.crear(req.body);
    res.status(201).json(paciente);
  } catch (error: any) {
    if (error.message?.includes("Ya existe") || error.message?.includes("ya está en uso") || error.message?.includes("No se encontró")) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Error al crear el paciente" });
  }
};

export const updatePacienteCompleto = async (req: Request, res: Response) => {
  try {
    const paciente = await pacienteCompletoService.actualizar(Number(req.params.id), req.body);
    res.json(paciente);
  } catch (error: any) {
    if (error.message?.includes("no encontrado")) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Error al actualizar el paciente" });
  }
};

export const deletePacienteCompleto = async (req: Request, res: Response) => {
  try {
    const historia = await pacienteCompletoService.eliminar(Number(req.params.id));
    res.json({ message: "Paciente desactivado correctamente", historia });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el paciente" });
  }
};
