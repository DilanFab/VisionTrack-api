import { Request, Response } from "express";
import * as usuarioService from "../../services/usuarioService";

export const getUsuarios = async (req: Request, res: Response) => {
  try {
    const result = await usuarioService.listar(req.query as any);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

export const getUsuarioById = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioService.obtenerPorId(Number(req.params.id));
    if (!usuario) { res.status(404).json({ error: "Usuario no encontrado" }); return; }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el usuario" });
  }
};

export const createUsuario = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioService.crear(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el usuario" });
  }
};

export const updateUsuario = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioService.actualizar(Number(req.params.id), req.body);
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el usuario" });
  }
};

export const deleteUsuario = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioService.eliminar(Number(req.params.id));
    res.json({ message: "Usuario desactivado correctamente", usuario });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el usuario" });
  }
};
