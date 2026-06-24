import { Request, Response } from "express";
import prisma from "../../config/prisma";

// GET /api/estados-cita
export const getEstadosCita = async (req: Request, res: Response) => {
  try {
    const estados = await prisma.tbl_estado_cita.findMany();
    res.json(estados);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener estados de cita" });
  }
};

// GET /api/estados-cita/:id
export const getEstadoCitaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const estado = await prisma.tbl_estado_cita.findUnique({
      where: { estado_cita_id: Number(id) },
    });
    if (!estado) {
      res.status(404).json({ error: "Estado de cita no encontrado" });
      return;
    }
    res.json(estado);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el estado de cita" });
  }
};

// POST /api/estados-cita
export const createEstadoCita = async (req: Request, res: Response) => {
  try {
    const { estado_cita_nombre, estado_cita_descripcion, estado_cita_estado } = req.body;
    const estado = await prisma.tbl_estado_cita.create({
      data: { estado_cita_nombre, estado_cita_descripcion, estado_cita_estado },
    });
    res.status(201).json(estado);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el estado de cita" });
  }
};

// PUT /api/estados-cita/:id
export const updateEstadoCita = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado_cita_nombre, estado_cita_descripcion, estado_cita_estado } = req.body;
    const estado = await prisma.tbl_estado_cita.update({
      where: { estado_cita_id: Number(id) },
      data: { estado_cita_nombre, estado_cita_descripcion, estado_cita_estado },
    });
    res.json(estado);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el estado de cita" });
  }
};

// DELETE /api/estados-cita/:id (borrado lógico)
export const deleteEstadoCita = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const estado = await prisma.tbl_estado_cita.update({
      where: { estado_cita_id: Number(id) },
      data: { estado_cita_estado: "I" },
    });
    res.json({ message: "Estado de cita desactivado correctamente", estado });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el estado de cita" });
  }
};