import { Request, Response } from "express";
import * as doctorService from "../../services/doctorService";

export const getDoctores = async (req: Request, res: Response) => {
  try {
    const result = await doctorService.listar(req.query as any);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener doctores" });
  }
};

export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const doctor = await doctorService.obtenerPorId(Number(req.params.id));
    if (!doctor) { res.status(404).json({ error: "Doctor no encontrado" }); return; }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el doctor" });
  }
};

export const createDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = await doctorService.crear(req.body);
    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el doctor" });
  }
};

export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = await doctorService.actualizar(Number(req.params.id), req.body);
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el doctor" });
  }
};

export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = await doctorService.eliminar(Number(req.params.id));
    res.json({ message: "Doctor desactivado correctamente", doctor });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el doctor" });
  }
};
