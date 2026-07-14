import { Request, Response } from "express";
import * as usuarioCompletoService from "../../services/usuarioCompletoService";

export const getUsuariosCompletos = async (_req: Request, res: Response) => {
  try {
    const usuarios = await usuarioCompletoService.listar();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los usuarios" });
  }
};

export const createUsuarioCompleto = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioCompletoService.crear(req.body);
    res.status(201).json(usuario);
  } catch (error: any) {
    if (error.message?.includes("Ya existe") || error.message?.includes("ya está en uso")) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Error al crear el usuario" });
  }
};

export const updateUsuarioCompleto = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioCompletoService.actualizar(Number(req.params.id), req.body);
    res.json(usuario);
  } catch (error: any) {
    if (error.message?.includes("no encontrado")) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Error al actualizar el usuario" });
  }
};

export const deleteUsuarioCompleto = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioCompletoService.eliminar(Number(req.params.id));
    res.json({ message: "Usuario desactivado correctamente", usuario });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el usuario" });
  }
};
