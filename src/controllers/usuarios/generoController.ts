import { Request, Response } from "express";
import prisma from "../../config/prisma";

// GET /api/generos
export const getGeneros = async (req: Request, res: Response) => {
  try {
    const generos = await prisma.tbl_genero.findMany();
    res.json(generos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener géneros" });
  }
};

// GET /api/generos/:id
export const getGeneroById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const genero = await prisma.tbl_genero.findUnique({
      where: { genero_id: Number(id) },
    });
    if (!genero) {
      res.status(404).json({ error: "Género no encontrado" });
      return;
    }
    res.json(genero);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el género" });
  }
};

// POST /api/generos
export const createGenero = async (req: Request, res: Response) => {
  try {
    const { genero_nombre, genero_estado } = req.body;
    const genero = await prisma.tbl_genero.create({
      data: { genero_nombre, genero_estado },
    });
    res.status(201).json(genero);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el género" });
  }
};

// PUT /api/generos/:id
export const updateGenero = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { genero_nombre, genero_estado } = req.body;
    const genero = await prisma.tbl_genero.update({
      where: { genero_id: Number(id) },
      data: { genero_nombre, genero_estado },
    });
    res.json(genero);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el género" });
  }
};

// DELETE /api/generos/:id (borrado lógico)
export const deleteGenero = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const genero = await prisma.tbl_genero.update({
      where: { genero_id: Number(id) },
      data: { genero_estado: "I" },
    });
    res.json({ message: "Género desactivado correctamente", genero });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el género" });
  }
};