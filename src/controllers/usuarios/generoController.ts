import { Request, Response } from "express";
import * as generoService from "../../services/generoService";

export const getGeneros = async (_req: Request, res: Response) => {
  try {
    const generos = await generoService.listar();
    res.json(generos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener géneros" });
  }
};

export const getGeneroById = async (req: Request, res: Response) => {
  try {
    const genero = await generoService.obtenerPorId(Number(req.params.id));
    if (!genero) { res.status(404).json({ error: "Género no encontrado" }); return; }
    res.json(genero);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el género" });
  }
};

export const createGenero = async (req: Request, res: Response) => {
  try {
    const genero = await generoService.crear(req.body);
    res.status(201).json(genero);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el género" });
  }
};

export const updateGenero = async (req: Request, res: Response) => {
  try {
    const genero = await generoService.actualizar(Number(req.params.id), req.body);
    res.json(genero);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el género" });
  }
};

export const deleteGenero = async (req: Request, res: Response) => {
  try {
    const genero = await generoService.eliminar(Number(req.params.id));
    res.json({ message: "Género desactivado correctamente", genero });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el género" });
  }
};
