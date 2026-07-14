import { Request, Response } from "express";
import * as usuarioService from "../../services/usuarioService";
import * as citaService from "../../services/citaService";

const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

export const getDisponibilidad = async (req: Request, res: Response) => {
  try {
    const { fecha, doctor_id } = req.query;
    if (!fecha || !doctor_id) {
      res.status(400).json({ error: "Los parámetros fecha y doctor_id son requeridos" });
      return;
    }

    const fechaDate = new Date(fecha as string);
    const diaNombre = DIAS_SEMANA[fechaDate.getDay()];

    const horarios = await require("../../config/prisma").default.tbl_horario_doctor.findMany({
      where: {
        doctor_id: Number(doctor_id),
        horario_doctor_dia: diaNombre as any,
        horario_doctor_estado: "A",
      },
      orderBy: { horario_doctor_inicio: "asc" },
    });

    if (horarios.length === 0) {
      res.json({ fecha, doctor_id: Number(doctor_id), dia: diaNombre, disponibles: [] });
      return;
    }

    const horarioIds = horarios.map((h: any) => h.horario_doctor_id);

    const prisma = require("../../config/prisma").default;
    const citasOcupadas = await prisma.tbl_cita.findMany({
      where: {
        horario_doctor_id: { in: horarioIds },
        cita_fecha: fechaDate,
        estado_cita: { estado_cita_nombre: { not: "Cancelada" } },
      },
      select: { horario_doctor_id: true },
    });

    const ocupados = new Set(citasOcupadas.map((c: any) => c.horario_doctor_id));

    const disponibles = horarios
      .filter((h: any) => !ocupados.has(h.horario_doctor_id))
      .map((h: any) => ({
        horario_doctor_id: h.horario_doctor_id,
        dia: h.horario_doctor_dia,
        inicio: h.horario_doctor_inicio,
        fin: h.horario_doctor_fin,
      }));

    res.json({ fecha, doctor_id: Number(doctor_id), dia: diaNombre, disponibles });
  } catch (error) {
    console.error("Error al obtener disponibilidad:", error);
    res.status(500).json({ error: "Error al obtener disponibilidad" });
  }
};

export const getMisCitas = async (req: Request, res: Response) => {
  try {
    const perfil = await usuarioService.obtenerPerfilPaciente(req.usuario!.usuario_id);
    if (!perfil) {
      res.status(404).json({ error: "Perfil de paciente no encontrado" });
      return;
    }

    const hc = await usuarioService.obtenerHistoriaClinica(perfil.perfil_id);
    if (!hc) {
      res.status(404).json({ error: "Historia clínica no encontrada" });
      return;
    }

    const result = await citaService.listarPorPaciente(hc.historia_clinica_id, req.query as any);
    res.json(result);
  } catch (error) {
    console.error("Error al obtener citas del paciente:", error);
    res.status(500).json({ error: "Error al obtener las citas" });
  }
};

export const agendarCita = async (req: Request, res: Response) => {
  try {
    const { horario_doctor_id, fecha, motivo } = req.body;

    if (!horario_doctor_id || !fecha || !motivo) {
      res.status(400).json({ error: "Los campos horario_doctor_id, fecha y motivo son requeridos" });
      return;
    }

    const perfil = await usuarioService.obtenerPerfilPaciente(req.usuario!.usuario_id);
    if (!perfil) {
      res.status(404).json({ error: "Perfil de paciente no encontrado" });
      return;
    }

    const hc = await usuarioService.obtenerHistoriaClinica(perfil.perfil_id);
    if (!hc) {
      res.status(404).json({ error: "Historia clínica no encontrada" });
      return;
    }

    const cita = await citaService.crear({
      horario_doctor_id: Number(horario_doctor_id),
      historia_clinica_id: hc.historia_clinica_id,
      cita_fecha: fecha,
      cita_motivo: motivo,
    });

    res.status(201).json(cita);
  } catch (error: any) {
    if (error.message?.includes("conflict")) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error("Error al agendar cita:", error);
    res.status(500).json({ error: "Error al agendar la cita" });
  }
};

export const cancelarCita = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const perfil = await usuarioService.obtenerPerfilPaciente(req.usuario!.usuario_id);
    if (!perfil) {
      res.status(404).json({ error: "Perfil de paciente no encontrado" });
      return;
    }

    const hc = await usuarioService.obtenerHistoriaClinica(perfil.perfil_id);
    if (!hc) {
      res.status(404).json({ error: "Historia clínica no encontrada" });
      return;
    }

    const prisma = require("../../config/prisma").default;
    const cita = await prisma.tbl_cita.findUnique({ where: { cita_id: Number(id) } });

    if (!cita) {
      res.status(404).json({ error: "Cita no encontrada" });
      return;
    }

    if (cita.historia_clinica_id !== hc.historia_clinica_id) {
      res.status(403).json({ error: "No tienes permiso para cancelar esta cita" });
      return;
    }

    const citaActualizada = await citaService.cancelar(Number(id));
    res.json({ message: "Cita cancelada correctamente", cita: citaActualizada });
  } catch (error) {
    console.error("Error al cancelar cita:", error);
    res.status(500).json({ error: "Error al cancelar la cita" });
  }
};
