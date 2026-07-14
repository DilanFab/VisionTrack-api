import { Request, Response } from "express";
import * as permisoService from "../../services/permisoService";

export const getPermisos = async (_req: Request, res: Response) => {
  try {
    const permisos = await permisoService.listar();
    res.json(permisos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener permisos" });
  }
};

export const getPermisoById = async (req: Request, res: Response) => {
  try {
    const permiso = await permisoService.obtenerPorId(Number(req.params.id));
    if (!permiso) { res.status(404).json({ error: "Permiso no encontrado" }); return; }
    res.json(permiso);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el permiso" });
  }
};

export const createPermiso = async (req: Request, res: Response) => {
  try {
    const permiso = await permisoService.crear(req.body);
    res.status(201).json(permiso);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el permiso" });
  }
};

export const updatePermiso = async (req: Request, res: Response) => {
  try {
    const permiso = await permisoService.actualizar(Number(req.params.id), req.body);
    res.json(permiso);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el permiso" });
  }
};

export const deletePermiso = async (req: Request, res: Response) => {
  try {
    const permiso = await permisoService.eliminar(Number(req.params.id));
    res.json({ message: "Permiso desactivado correctamente", permiso });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el permiso" });
  }
};

export const setPermisosDeRol = async (req: Request, res: Response) => {
  try {
    const permisos = await permisoService.reemplazarPermisosDeRol(Number(req.params.id), req.body.menu_ids);
    res.json(permisos);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar los permisos del rol" });
  }
};
