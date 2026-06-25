import { Request, Response } from "express";
import prisma from "../../config/prisma";

// GET /api/citas
export const getCitas = async (req: Request, res: Response) => {
  try {
    const citas = await prisma.tbl_cita.findMany();
    res.json(citas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener citas" });
  }
};

// GET /api/citas/:id
export const getCitaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cita = await prisma.tbl_cita.findUnique({
      where: { cita_id: Number(id) },
    });
    if (!cita) {
      res.status(404).json({ error: "Cita no encontrada" });
      return;
    }
    res.json(cita);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la cita" });
  }
};

// POST /api/citas
export const createCita = async (req: Request, res: Response) => {
  try {
    const {
      horario_doctor_id,
      historia_clinica_id,
      cita_fecha,
      cita_motivo,
      estado_cita_id,
    } = req.body;

    const cita = await prisma.tbl_cita.create({
      data: {
        horario_doctor_id,
        historia_clinica_id,
        cita_fecha: new Date(cita_fecha),
        cita_motivo,
        estado_cita_id,
      },
    });
    res.status(201).json(cita);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la cita" });
  }
};

// PUT /api/citas/:id
export const updateCita = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      horario_doctor_id,
      historia_clinica_id,
      cita_fecha,
      cita_motivo,
      estado_cita_id,
    } = req.body;

    const cita = await prisma.tbl_cita.update({
      where: { cita_id: Number(id) },
      data: {
        horario_doctor_id,
        historia_clinica_id,
        cita_fecha: cita_fecha ? new Date(cita_fecha) : undefined,
        cita_motivo,
        estado_cita_id,
      },
    });
    res.json(cita);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la cita" });
  }
};

// DELETE /api/citas/:id (cancelación lógica)
export const deleteCita = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const estadoCancelada = await prisma.tbl_estado_cita.findFirst({
      where: { estado_cita_nombre: "Cancelada" },
    });

    if (!estadoCancelada) {
      res.status(500).json({
        error: "No existe un estado 'Cancelada' configurado en tbl_estado_cita",
      });
      return;
    }

    const cita = await prisma.tbl_cita.update({
      where: { cita_id: Number(id) },
      data: { estado_cita_id: estadoCancelada.estado_cita_id },
    });

    res.json({ message: "Cita cancelada correctamente", cita });
  } catch (error) {
    res.status(500).json({ error: "Error al cancelar la cita" });
  }
};