import { Request, Response } from "express";
import prisma from "../../config/prisma";

// GET /api/doctores
export const getDoctores = async (req: Request, res: Response) => {
  try {
    const doctores = await prisma.tbl_doctor.findMany();
    res.json(doctores);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener doctores" });
  }
};

// GET /api/doctores/:id
export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doctor = await prisma.tbl_doctor.findUnique({
      where: { doctor_id: Number(id) },
    });
    if (!doctor) {
      res.status(404).json({ error: "Doctor no encontrado" });
      return;
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el doctor" });
  }
};

// POST /api/doctores
export const createDoctor = async (req: Request, res: Response) => {
  try {
    const { especialidad_medica_id, perfil_id, doctor_estado } = req.body;
    const doctor = await prisma.tbl_doctor.create({
      data: { especialidad_medica_id, perfil_id, doctor_estado },
    });
    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el doctor" });
  }
};

// PUT /api/doctores/:id
export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { especialidad_medica_id, perfil_id, doctor_estado } = req.body;
    const doctor = await prisma.tbl_doctor.update({
      where: { doctor_id: Number(id) },
      data: { especialidad_medica_id, perfil_id, doctor_estado },
    });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el doctor" });
  }
};

// DELETE /api/doctores/:id (borrado lógico)
export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doctor = await prisma.tbl_doctor.update({
      where: { doctor_id: Number(id) },
      data: { doctor_estado: "I" },
    });
    res.json({ message: "Doctor desactivado correctamente", doctor });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el doctor" });
  }
};