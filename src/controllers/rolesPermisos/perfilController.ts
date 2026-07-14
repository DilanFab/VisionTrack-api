import { Request, Response } from "express";
import * as perfilService from "../../services/perfilService";

export const getPerfiles = async (_req: Request, res: Response) => {
  try {
    const perfiles = await perfilService.listar();
    res.json(perfiles);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener perfiles" });
  }
};

export const getPerfilById = async (req: Request, res: Response) => {
  try {
    const perfil = await perfilService.obtenerPorId(Number(req.params.id));
    if (!perfil) { res.status(404).json({ error: "Perfil no encontrado" }); return; }
    res.json(perfil);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
};

export const createPerfil = async (req: Request, res: Response) => {
  try {
    const perfil = await perfilService.crear(req.body);
    res.status(201).json(perfil);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el perfil" });
  }
};

export const updatePerfil = async (req: Request, res: Response) => {
  try {
    const perfil = await perfilService.actualizar(Number(req.params.id), req.body);
    res.json(perfil);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el perfil" });
  }
};

export const deletePerfil = async (req: Request, res: Response) => {
  try {
    const perfil = await perfilService.eliminar(Number(req.params.id));
    res.json({ message: "Perfil desactivado correctamente", perfil });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el perfil" });
  }
};
