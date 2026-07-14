import { Request, Response } from "express";
import * as horarioDoctorService from "../../services/horarioDoctorService";

export const getHorariosDoctor = async (req: Request, res: Response) => {
  try {
    const result = await horarioDoctorService.listar(req.query as any);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener horarios de doctores" });
  }
};

export const getHorariosPorDoctor = async (req: Request, res: Response) => {
  try {
    const horarios = await horarioDoctorService.listarPorDoctor(Number(req.params.doctorId));
    res.json(horarios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los horarios del doctor" });
  }
};

export const setHorariosPorDoctor = async (req: Request, res: Response) => {
  try {
    const horarios = await horarioDoctorService.reemplazarHorariosPorDoctor(Number(req.params.doctorId), req.body.horarios);
    res.json(horarios);
  } catch (error) {
    res.status(500).json({ error: "Error al guardar el horario del doctor" });
  }
};

export const getHorarioDoctorById = async (req: Request, res: Response) => {
  try {
    const horario = await horarioDoctorService.obtenerPorId(Number(req.params.id));
    if (!horario) { res.status(404).json({ error: "Horario no encontrado" }); return; }
    res.json(horario);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el horario" });
  }
};

export const createHorarioDoctor = async (req: Request, res: Response) => {
  try {
    const horario = await horarioDoctorService.crear(req.body);
    res.status(201).json(horario);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el horario" });
  }
};

export const updateHorarioDoctor = async (req: Request, res: Response) => {
  try {
    const horario = await horarioDoctorService.actualizar(Number(req.params.id), req.body);
    res.json(horario);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el horario" });
  }
};

export const deleteHorarioDoctor = async (req: Request, res: Response) => {
  try {
    const horario = await horarioDoctorService.eliminar(Number(req.params.id));
    res.json({ message: "Horario desactivado correctamente", horario });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el horario" });
  }
};
