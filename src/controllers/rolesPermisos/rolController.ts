import { Request, Response } from "express";
import * as rolService from "../../services/rolService";

export const getRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await rolService.listar();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener roles" });
  }
};

export const getRolById = async (req: Request, res: Response) => {
  try {
    const rol = await rolService.obtenerPorId(Number(req.params.id));
    if (!rol) { res.status(404).json({ error: "Rol no encontrado" }); return; }
    res.json(rol);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el rol" });
  }
};

export const createRol = async (req: Request, res: Response) => {
  try {
    const rol = await rolService.crear(req.body);
    res.status(201).json(rol);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el rol" });
  }
};

export const updateRol = async (req: Request, res: Response) => {
  try {
    const rol = await rolService.actualizar(Number(req.params.id), req.body);
    res.json(rol);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el rol" });
  }
};

export const deleteRol = async (req: Request, res: Response) => {
  try {
    const rol = await rolService.eliminar(Number(req.params.id));
    res.json({ message: "Rol desactivado correctamente", rol });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el rol" });
  }
};
