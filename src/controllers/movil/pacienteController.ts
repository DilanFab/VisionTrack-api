import { Request, Response } from "express";
import * as usuarioService from "../../services/usuarioService";
import * as citaService from "../../services/citaService";
import * as doctorCompletoService from "../../services/doctorCompletoService";
import * as horarioDoctorService from "../../services/horarioDoctorService";
import prisma from "../../config/prisma";
import { logger } from "../../utils/logger";

const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
const ESTADO_CONFIRMADA = "Confirmada";

/**
 * @openapi
 * /api/movil/disponibilidad:
 *   get:
 *     tags: [Movil]
 *     summary: Obtener slots disponibles de un doctor en una fecha (público)
 *     parameters:
 *       - { name: fecha, in: query, required: true, schema: { type: string }, example: "2026-07-15" }
 *       - { name: doctor_id, in: query, required: true, schema: { type: integer }, example: 1 }
 *     responses:
 *       200:
 *         description: Slots disponibles
 *       400:
 *         description: Parámetros requeridos
 */
export const getDisponibilidad = async (req: Request, res: Response) => {
  try {
    const { fecha, doctor_id } = req.query;
    if (!fecha || !doctor_id) {
      res.status(400).json({ error: "Los parámetros fecha y doctor_id son requeridos" });
      return;
    }

    const fechaDate = new Date(fecha as string);
    const diaNombre = DIAS_SEMANA[fechaDate.getDay()];

    const horarios = await prisma.tbl_horario_doctor.findMany({
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
    logger.error({ err: error }, "Error al obtener disponibilidad");
    res.status(500).json({ error: "Error al obtener disponibilidad" });
  }
};

export const getDoctores = async (_req: Request, res: Response) => {
  try {
    const doctores = await doctorCompletoService.listar();
    res.json(doctores.filter((doctor) => doctor.doctor_estado === "A"));
  } catch (error) {
    logger.error({ err: error }, "Error al obtener doctores para móvil");
    res.status(500).json({ error: "Error al obtener doctores" });
  }
};

export const getHorariosPorDoctor = async (req: Request, res: Response) => {
  try {
    const horarios = await horarioDoctorService.listarPorDoctor(Number(req.params.doctorId));
    res.json(horarios);
  } catch (error) {
    logger.error({ err: error }, "Error al obtener horarios para móvil");
    res.status(500).json({ error: "Error al obtener horarios" });
  }
};

export const getOcupadosPorDoctor = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const { desde, hasta } = req.query;

    if (!desde || !hasta) {
      res.status(400).json({ error: "Los parámetros desde y hasta son requeridos" });
      return;
    }

    const ocupados = await prisma.tbl_cita.findMany({
      where: {
        cita_fecha: {
          gte: new Date(desde as string),
          lte: new Date(hasta as string),
        },
        horario_doctor: { doctor_id: Number(doctorId) },
        estado_cita: { estado_cita_nombre: { not: "Cancelada" } },
      },
      select: {
        horario_doctor_id: true,
        cita_fecha: true,
      },
    });

    res.json(ocupados);
  } catch (error) {
    logger.error({ err: error }, "Error al obtener horarios ocupados");
    res.status(500).json({ error: "Error al obtener horarios ocupados" });
  }
};

/**
 * @openapi
 * /api/movil/mis-citas:
 *   get:
 *     tags: [Movil]
 *     summary: Listar citas del paciente autenticado (paginado)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer }, example: 1 }
 *       - { name: limit, in: query, schema: { type: integer }, example: 20 }
 *     responses:
 *       200:
 *         description: Citas del paciente
 *       404:
 *         description: Perfil no encontrado
 */
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
    logger.error({ err: error }, "Error al obtener citas del paciente");
    res.status(500).json({ error: "Error al obtener las citas" });
  }
};

export const confirmarCita = async (req: Request, res: Response) => {
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

    const cita = await prisma.tbl_cita.findUnique({ where: { cita_id: Number(req.params.id) } });
    if (!cita) {
      res.status(404).json({ error: "Cita no encontrada" });
      return;
    }

    if (cita.historia_clinica_id !== hc.historia_clinica_id) {
      res.status(403).json({ error: "No tienes permiso para confirmar esta cita" });
      return;
    }

    const estadoConfirmada = await prisma.tbl_estado_cita.findFirst({
      where: { estado_cita_nombre: ESTADO_CONFIRMADA },
    });
    if (!estadoConfirmada) {
      res.status(500).json({ error: `No existe un estado '${ESTADO_CONFIRMADA}' configurado` });
      return;
    }

    const citaActualizada = await prisma.tbl_cita.update({
      where: { cita_id: Number(req.params.id) },
      data: { estado_cita_id: estadoConfirmada.estado_cita_id },
      include: citaService.citaInclude,
    });

    res.json(citaActualizada);
  } catch (error) {
    logger.error({ err: error }, "Error al confirmar cita");
    res.status(500).json({ error: "Error al confirmar la cita" });
  }
};

/**
 * @openapi
 * /api/movil/agendar:
 *   post:
 *     tags: [Movil]
 *     summary: Agendar cita para el paciente autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [horario_doctor_id, fecha, motivo]
 *             properties:
 *               horario_doctor_id: { type: integer, example: 1 }
 *               fecha: { type: string, example: "2026-07-15" }
 *               motivo: { type: string, example: "Examen visual" }
 *     responses:
 *       201:
 *         description: Cita agendada
 *       400:
 *         description: Conflicto de horario
 *       404:
 *         description: Perfil no encontrado
 */
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
    if (error.message?.includes("cita agendada")) {
      res.status(400).json({ error: error.message });
      return;
    }
    logger.error({ err: error }, "Error al agendar cita");
    res.status(500).json({ error: "Error al agendar la cita" });
  }
};

/**
 * @openapi
 * /api/movil/mis-citas/{id}:
 *   delete:
 *     tags: [Movil]
 *     summary: Cancelar cita propia del paciente autenticado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Cita cancelada
 *       403:
 *         description: No tiene permiso para cancelar esta cita
 *       404:
 *         description: Cita no encontrada
 */
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
    res.json(citaActualizada);
  } catch (error) {
    logger.error({ err: error }, "Error al cancelar cita");
    res.status(500).json({ error: "Error al cancelar la cita" });
  }
};
