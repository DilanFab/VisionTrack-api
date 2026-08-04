import { Request, Response } from "express";
import prisma from "../../config/prisma";

const ESTADO_CITA_DEFECTO = "Programada";
const ESTADO_CITA_CANCELADA = "Cancelada";
const ESTADO_CITA_CONFIRMADA = "Confirmada";
const ROL_PACIENTE = "Paciente";

// Igual que DIA_INDICE en VisionTrack-front/src/components/citas/CitaCalendario.tsx:
// convención de Date.getUTCDay() (0=domingo..6=sábado).
const DIA_POR_INDICE: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miercoles",
  4: "Jueves",
  5: "Viernes",
};

const citaInclude = {
  horario_doctor: {
    include: {
      doctor: {
        include: {
          especialidad_medica: true,
          perfil: {
            include: {
              usuario: { include: { persona: true } },
            },
          },
        },
      },
    },
  },
  historia_clinica: {
    include: {
      perfil: {
        include: {
          usuario: { include: { persona: true } },
        },
      },
    },
  },
  estado_cita: true,
};

// Una cita ocupa un slot (doctor + horario recurrente + fecha real). Se
// considera "ocupado" si ya existe una cita activa (no cancelada) para ese
// mismo horario_doctor_id y cita_fecha exactos.
const existeConflictoDeHorario = async (
  horario_doctor_id: number,
  cita_fecha: Date,
  excluirCitaId?: number
) => {
  const conflicto = await prisma.tbl_cita.findFirst({
    where: {
      horario_doctor_id,
      cita_fecha,
      estado_cita: { estado_cita_nombre: { not: ESTADO_CITA_CANCELADA } },
      ...(excluirCitaId ? { cita_id: { not: excluirCitaId } } : {}),
    },
  });
  return !!conflicto;
};

// Resuelve los historia_clinica_id que pertenecen al paciente autenticado
// (a través de su perfil con rol "Paciente"), no al usuario en general.
const obtenerHistoriaClinicaIdsDelPaciente = async (usuario_id: number) => {
  const perfil = await prisma.tbl_perfil.findFirst({
    where: {
      usuario_id,
      perfil_estado: "A",
      rol: { rol_nombre: ROL_PACIENTE },
    },
  });
  if (!perfil) return [];

  const historias = await prisma.tbl_historia_clinica.findMany({
    where: { paciente_id: perfil.perfil_id },
    select: { historia_clinica_id: true },
  });
  return historias.map((h) => h.historia_clinica_id);
};

// GET /api/citas/mis-citas (paciente autenticado)
export const getMisCitas = async (req: Request, res: Response) => {
  try {
    const historiaClinicaIds = await obtenerHistoriaClinicaIdsDelPaciente(req.usuario!.usuario_id);

    const citas = await prisma.tbl_cita.findMany({
      where: { historia_clinica_id: { in: historiaClinicaIds } },
      include: citaInclude,
      orderBy: { cita_fecha: "desc" },
    });
    res.json(citas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tus citas" });
  }
};

// GET /api/citas/ocupados/:doctorId?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
// Devuelve solo (horario_doctor_id, cita_fecha) de citas activas de ese
// doctor en el rango dado — sin datos de paciente — para que el cliente
// pueda marcar slots ocupados sin exponer información de otros pacientes.
export const getOcupadosPorDoctor = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const { desde, hasta } = req.query;

    if (!desde || !hasta) {
      res.status(400).json({ error: "desde y hasta son obligatorios" });
      return;
    }

    const ocupados = await prisma.tbl_cita.findMany({
      where: {
        horario_doctor: { doctor_id: Number(doctorId) },
        cita_fecha: { gte: new Date(String(desde)), lte: new Date(String(hasta)) },
        estado_cita: { estado_cita_nombre: { not: ESTADO_CITA_CANCELADA } },
      },
      select: { horario_doctor_id: true, cita_fecha: true },
    });
    res.json(ocupados);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los horarios ocupados" });
  }
};

// POST /api/citas/mis-citas (paciente autenticado crea una cita para sí mismo)
export const crearMiCita = async (req: Request, res: Response) => {
  try {
    const { horario_doctor_id, cita_fecha, cita_motivo } = req.body;

    if (!horario_doctor_id || !cita_fecha || !cita_motivo) {
      res.status(400).json({ error: "horario_doctor_id, cita_fecha y cita_motivo son obligatorios" });
      return;
    }

    const historiaClinicaIds = await obtenerHistoriaClinicaIdsDelPaciente(req.usuario!.usuario_id);
    if (historiaClinicaIds.length === 0) {
      res.status(404).json({ error: "No se encontró un historial clínico asociado a este usuario" });
      return;
    }

    const horario = await prisma.tbl_horario_doctor.findUnique({
      where: { horario_doctor_id: Number(horario_doctor_id) },
    });
    if (!horario || horario.horario_doctor_estado !== "A") {
      res.status(404).json({ error: "Horario no encontrado" });
      return;
    }

    const fecha = new Date(cita_fecha);
    const diaEsperado = DIA_POR_INDICE[fecha.getUTCDay()];
    if (diaEsperado !== horario.horario_doctor_dia) {
      res.status(400).json({ error: "La fecha elegida no corresponde al día de este horario" });
      return;
    }

    const conflicto = await existeConflictoDeHorario(Number(horario_doctor_id), fecha);
    if (conflicto) {
      res.status(400).json({ error: "El doctor ya tiene una cita agendada en esa fecha y hora" });
      return;
    }

    const estadoProgramada = await prisma.tbl_estado_cita.findFirst({
      where: { estado_cita_nombre: ESTADO_CITA_DEFECTO },
    });
    if (!estadoProgramada) {
      res.status(500).json({
        error: `No existe un estado '${ESTADO_CITA_DEFECTO}' configurado en tbl_estado_cita`,
      });
      return;
    }

    const cita = await prisma.tbl_cita.create({
      data: {
        horario_doctor_id: Number(horario_doctor_id),
        historia_clinica_id: historiaClinicaIds[0],
        cita_fecha: fecha,
        cita_motivo,
        estado_cita_id: estadoProgramada.estado_cita_id,
      },
      include: citaInclude,
    });
    res.status(201).json(cita);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la cita" });
  }
};

// PATCH /api/citas/:id/confirmar (paciente autenticado)
export const confirmarCita = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const historiaClinicaIds = await obtenerHistoriaClinicaIdsDelPaciente(req.usuario!.usuario_id);

    const cita = await prisma.tbl_cita.findUnique({
      where: { cita_id: Number(id) },
      include: { estado_cita: true },
    });

    if (!cita || !historiaClinicaIds.includes(cita.historia_clinica_id)) {
      res.status(404).json({ error: "Cita no encontrada" });
      return;
    }

    if (cita.estado_cita.estado_cita_nombre !== ESTADO_CITA_DEFECTO) {
      res.status(400).json({ error: "Solo se pueden confirmar citas en estado Programada" });
      return;
    }

    const estadoConfirmada = await prisma.tbl_estado_cita.findFirst({
      where: { estado_cita_nombre: ESTADO_CITA_CONFIRMADA },
    });
    if (!estadoConfirmada) {
      res.status(500).json({
        error: `No existe un estado '${ESTADO_CITA_CONFIRMADA}' configurado en tbl_estado_cita`,
      });
      return;
    }

    const citaActualizada = await prisma.tbl_cita.update({
      where: { cita_id: Number(id) },
      data: { estado_cita_id: estadoConfirmada.estado_cita_id },
      include: citaInclude,
    });
    res.json(citaActualizada);
  } catch (error) {
    res.status(500).json({ error: "Error al confirmar la cita" });
  }
};

// PATCH /api/citas/:id/cancelar (paciente autenticado)
export const cancelarCita = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    if (!motivo || !String(motivo).trim()) {
      res.status(400).json({ error: "El motivo de cancelación es obligatorio" });
      return;
    }

    const historiaClinicaIds = await obtenerHistoriaClinicaIdsDelPaciente(req.usuario!.usuario_id);

    const cita = await prisma.tbl_cita.findUnique({
      where: { cita_id: Number(id) },
      include: { estado_cita: true },
    });

    if (!cita || !historiaClinicaIds.includes(cita.historia_clinica_id)) {
      res.status(404).json({ error: "Cita no encontrada" });
      return;
    }

    if (cita.estado_cita.estado_cita_nombre !== ESTADO_CITA_DEFECTO) {
      res.status(400).json({ error: "Solo se pueden cancelar citas en estado Programada" });
      return;
    }

    const estadoCancelada = await prisma.tbl_estado_cita.findFirst({
      where: { estado_cita_nombre: ESTADO_CITA_CANCELADA },
    });
    if (!estadoCancelada) {
      res.status(500).json({
        error: `No existe un estado '${ESTADO_CITA_CANCELADA}' configurado en tbl_estado_cita`,
      });
      return;
    }

    const citaActualizada = await prisma.tbl_cita.update({
      where: { cita_id: Number(id) },
      data: {
        estado_cita_id: estadoCancelada.estado_cita_id,
        cita_motivo_cancelacion: String(motivo).trim(),
      },
      include: citaInclude,
    });
    res.json(citaActualizada);
  } catch (error) {
    res.status(500).json({ error: "Error al cancelar la cita" });
  }
};

// GET /api/citas
export const getCitas = async (req: Request, res: Response) => {
  try {
    const citas = await prisma.tbl_cita.findMany({ include: citaInclude });
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
      include: citaInclude,
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
    const { horario_doctor_id, historia_clinica_id, cita_fecha, cita_motivo } = req.body;

    const fecha = new Date(cita_fecha);

    const conflicto = await existeConflictoDeHorario(Number(horario_doctor_id), fecha);
    if (conflicto) {
      res.status(400).json({ error: "El doctor ya tiene una cita agendada en esa fecha y hora" });
      return;
    }

    const estadoProgramada = await prisma.tbl_estado_cita.findFirst({
      where: { estado_cita_nombre: ESTADO_CITA_DEFECTO },
    });
    if (!estadoProgramada) {
      res.status(500).json({
        error: `No existe un estado '${ESTADO_CITA_DEFECTO}' configurado en tbl_estado_cita`,
      });
      return;
    }

    const cita = await prisma.tbl_cita.create({
      data: {
        horario_doctor_id: Number(horario_doctor_id),
        historia_clinica_id: Number(historia_clinica_id),
        cita_fecha: fecha,
        cita_motivo,
        estado_cita_id: estadoProgramada.estado_cita_id,
      },
      include: citaInclude,
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
    const { horario_doctor_id, historia_clinica_id, cita_fecha, cita_motivo, estado_cita_id } = req.body;

    const fecha = new Date(cita_fecha);

    const conflicto = await existeConflictoDeHorario(Number(horario_doctor_id), fecha, Number(id));
    if (conflicto) {
      res.status(400).json({ error: "El doctor ya tiene una cita agendada en esa fecha y hora" });
      return;
    }

    const cita = await prisma.tbl_cita.update({
      where: { cita_id: Number(id) },
      data: {
        horario_doctor_id: Number(horario_doctor_id),
        historia_clinica_id: Number(historia_clinica_id),
        cita_fecha: fecha,
        cita_motivo,
        estado_cita_id: Number(estado_cita_id),
      },
      include: citaInclude,
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
      where: { estado_cita_nombre: ESTADO_CITA_CANCELADA },
    });

    if (!estadoCancelada) {
      res.status(500).json({
        error: `No existe un estado '${ESTADO_CITA_CANCELADA}' configurado en tbl_estado_cita`,
      });
      return;
    }

    const cita = await prisma.tbl_cita.update({
      where: { cita_id: Number(id) },
      data: { estado_cita_id: estadoCancelada.estado_cita_id },
      include: citaInclude,
    });

    res.json({ message: "Cita cancelada correctamente", cita });
  } catch (error) {
    res.status(500).json({ error: "Error al cancelar la cita" });
  }
};
