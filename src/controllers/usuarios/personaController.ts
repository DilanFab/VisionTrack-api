import { Request, Response } from "express";
import * as personaService from "../../services/personaService";

export const getPersonas = async (req: Request, res: Response) => {
  try {
    const result = await personaService.listar(req.query as any);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener personas" });
  }
};

export const getPersonaById = async (req: Request, res: Response) => {
  try {
    const persona = await personaService.obtenerPorId(Number(req.params.id));
    if (!persona) { res.status(404).json({ error: "Persona no encontrada" }); return; }
    res.json(persona);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la persona" });
  }
};

export const createPersona = async (req: Request, res: Response) => {
  try {
    const persona = await personaService.crear(req.body);
    res.status(201).json(persona);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la persona" });
  }
};

export const updatePersona = async (req: Request, res: Response) => {
  try {
    const persona = await personaService.actualizar(Number(req.params.id), req.body);
    res.json(persona);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la persona" });
  }
};

export const deletePersona = async (req: Request, res: Response) => {
  try {
    const persona = await personaService.eliminar(Number(req.params.id));
    res.json({ message: "Persona desactivada correctamente", persona });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar la persona" });
  }
};
