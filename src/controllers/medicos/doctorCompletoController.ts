import { Request, Response } from "express";
import * as doctorCompletoService from "../../services/doctorCompletoService";

export const getDoctoresCompletos = async (_req: Request, res: Response) => {
  try {
    const doctores = await doctorCompletoService.listar();
    res.json(doctores);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los doctores" });
  }
};

export const createDoctorCompleto = async (req: Request, res: Response) => {
  try {
    const doctor = await doctorCompletoService.crear(req.body);
    res.status(201).json(doctor);
  } catch (error: any) {
    if (error.message?.includes("Ya existe") || error.message?.includes("ya está en uso") || error.message?.includes("No se encontró")) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Error al crear el doctor" });
  }
};

export const updateDoctorCompleto = async (req: Request, res: Response) => {
  try {
    const doctor = await doctorCompletoService.actualizar(Number(req.params.id), req.body);
    res.json(doctor);
  } catch (error: any) {
    if (error.message?.includes("no encontrado")) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Error al actualizar el doctor" });
  }
};

export const deleteDoctorCompleto = async (req: Request, res: Response) => {
  try {
    const doctor = await doctorCompletoService.eliminar(Number(req.params.id));
    res.json({ message: "Doctor desactivado correctamente", doctor });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el doctor" });
  }
};
