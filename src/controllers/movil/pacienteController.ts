import { Request, Response } from "express";
import prisma from "../../config/prisma";
import { existeConflictoDeHorario } from "../citas/citaController";

const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

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

async function getPerfilPaciente(usuarioId: number) {
  const perfil = await prisma.tbl_perfil.findFirst({
    where: {
      usuario_id: usuarioId,
      rol: { rol_nombre: "Paciente" },
      perfil_estado: "A",
    },
  });
  return perfil;
}

async function getHistoriaClinica(perfilId: number) {
  const hc = await prisma.tbl_historia_clinica.findFirst({
    where: { paciente_id: perfilId, historia_clinica_estado: "A" },
  });
  return hc;
}

// GET /api/movil/disponibilidad?fecha=YYYY-MM-DD&doctor_id=X
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

    const horarioIds = horarios.map((h) => h.horario_doctor_id);

    const citasOcupadas = await prisma.tbl_cita.findMany({
      where: {
        horario_doctor_id: { in: horarioIds },
        cita_fecha: fechaDate,
        estado_cita: { estado_cita_nombre: { not: "Cancelada" } },
      },
      select: { horario_doctor_id: true },
    });

    const ocupados = new Set(citasOcupadas.map((c) => c.horario_doctor_id));

    const disponibles = horarios
      .filter((h) => !ocupados.has(h.horario_doctor_id))
      .map((h) => ({
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

// GET /api/movil/mis-citas
export const getMisCitas = async (req: Request, res: Response) => {
  try {
    const perfil = await getPerfilPaciente(req.usuario!.usuario_id);
    if (!perfil) {
      res.status(404).json({ error: "Perfil de paciente no encontrado" });
      return;
    }

    const hc = await getHistoriaClinica(perfil.perfil_id);
    if (!hc) {
      res.status(404).json({ error: "Historia clínica no encontrada" });
      return;
    }

    const citas = await prisma.tbl_cita.findMany({
      where: { historia_clinica_id: hc.historia_clinica_id },
      include: citaInclude,
      orderBy: { cita_fecha: "desc" },
    });

    res.json(citas);
  } catch (error) {
    console.error("Error al obtener citas del paciente:", error);
    res.status(500).json({ error: "Error al obtener las citas" });
  }
};

// POST /api/movil/agendar
export const agendarCita = async (req: Request, res: Response) => {
  try {
    const { horario_doctor_id, fecha, motivo } = req.body;

    if (!horario_doctor_id || !fecha || !motivo) {
      res.status(400).json({ error: "Los campos horario_doctor_id, fecha y motivo son requeridos" });
      return;
    }

    const perfil = await getPerfilPaciente(req.usuario!.usuario_id);
    if (!perfil) {
      res.status(404).json({ error: "Perfil de paciente no encontrado" });
      return;
    }

    const hc = await getHistoriaClinica(perfil.perfil_id);
    if (!hc) {
      res.status(404).json({ error: "Historia clínica no encontrada" });
      return;
    }

    const fechaDate = new Date(fecha);
    const conflicto = await existeConflictoDeHorario(Number(horario_doctor_id), fechaDate);
    if (conflicto) {
      res.status(400).json({ error: "El doctor ya tiene una cita agendada en esa fecha y hora" });
      return;
    }

    const estadoProgramada = await prisma.tbl_estado_cita.findFirst({
      where: { estado_cita_nombre: "Programada" },
    });
    if (!estadoProgramada) {
      res.status(500).json({ error: "No existe un estado 'Programada' configurado" });
      return;
    }

    const cita = await prisma.tbl_cita.create({
      data: {
        horario_doctor_id: Number(horario_doctor_id),
        historia_clinica_id: hc.historia_clinica_id,
        cita_fecha: fechaDate,
        cita_motivo: motivo,
        estado_cita_id: estadoProgramada.estado_cita_id,
      },
      include: citaInclude,
    });

    res.status(201).json(cita);
  } catch (error) {
    console.error("Error al agendar cita:", error);
    res.status(500).json({ error: "Error al agendar la cita" });
  }
};

// DELETE /api/movil/mis-citas/:id
export const cancelarCita = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const perfil = await getPerfilPaciente(req.usuario!.usuario_id);
    if (!perfil) {
      res.status(404).json({ error: "Perfil de paciente no encontrado" });
      return;
    }

    const hc = await getHistoriaClinica(perfil.perfil_id);
    if (!hc) {
      res.status(404).json({ error: "Historia clínica no encontrada" });
      return;
    }

    const cita = await prisma.tbl_cita.findUnique({
      where: { cita_id: Number(id) },
    });

    if (!cita) {
      res.status(404).json({ error: "Cita no encontrada" });
      return;
    }

    if (cita.historia_clinica_id !== hc.historia_clinica_id) {
      res.status(403).json({ error: "No tienes permiso para cancelar esta cita" });
      return;
    }

    const estadoCancelada = await prisma.tbl_estado_cita.findFirst({
      where: { estado_cita_nombre: "Cancelada" },
    });
    if (!estadoCancelada) {
      res.status(500).json({ error: "No existe un estado 'Cancelada' configurado" });
      return;
    }

    const citaActualizada = await prisma.tbl_cita.update({
      where: { cita_id: Number(id) },
      data: { estado_cita_id: estadoCancelada.estado_cita_id },
      include: citaInclude,
    });

    res.json({ message: "Cita cancelada correctamente", cita: citaActualizada });
  } catch (error) {
    console.error("Error al cancelar cita:", error);
    res.status(500).json({ error: "Error al cancelar la cita" });
  }
};
