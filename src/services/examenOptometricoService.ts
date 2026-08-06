import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";
import { getPagination, paginatedResponse } from "../utils/pagination";
import { buildDateFilter, buildEstadoFilter, buildIntFilter } from "../utils/filters";
import {
  examenOptometricoCreateSchema,
  examenOptometricoQuerySchema,
  examenOptometricoUpdateSchema,
  ExamenOptometricoCreateInput,
  ExamenOptometricoUpdateInput,
} from "../validations/examenOptometrico.schema";

const ESTADO_BORRADOR = "B";
const ESTADO_FINALIZADO = "F";
const ESTADO_INACTIVO = "I";

export const JSON_SECTION_FIELDS = [
  "lensometria",
  "agudeza_visual",
  "biomicroscopia",
  "reflejos_pupilares",
  "oftalmoscopia",
  "examen_motor",
  "queratometria",
  "refraccion",
] as const;

export const examenOptometricoInclude = {
  historia_clinica: true,
  cita: true,
  examinador: {
    select: {
      usuario_id: true,
      usuario_nombre: true,
      persona: true,
    },
  },
};

const parseOrThrow = <T>(result: { success: true; data: T } | { success: false; error: { issues: { message: string }[] } }): T => {
  if (!result.success) {
    throw { status: 400, message: result.error.issues[0]?.message || "Datos inválidos" };
  }
  return result.data;
};

const parseTime = (value: string | null | undefined): Date | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const normalized = value.length === 5 ? `${value}:00` : value;
  return new Date(`1970-01-01T${normalized}.000Z`);
};

const withJsonDefaults = (data: ExamenOptometricoCreateInput) => {
  const result: Record<string, Prisma.InputJsonValue> = {};
  for (const field of JSON_SECTION_FIELDS) {
    result[field] = (data[field] ?? {}) as Prisma.InputJsonValue;
  }
  return result;
};

const jsonUpdates = (data: ExamenOptometricoUpdateInput) => {
  const result: Record<string, Prisma.InputJsonValue> = {};
  for (const field of JSON_SECTION_FIELDS) {
    if (data[field] !== undefined) {
      result[field] = data[field] as Prisma.InputJsonValue;
    }
  }
  return result;
};

const ensureHistoriaClinicaActiva = async (historiaClinicaId: number) => {
  const historia = await prisma.tbl_historia_clinica.findFirst({
    where: { historia_clinica_id: historiaClinicaId, historia_clinica_estado: "A" },
  });
  if (!historia) {
    throw { status: 404, message: "Historia clínica no encontrada o inactiva" };
  }
  return historia;
};

const ensureCitaPerteneceAHistoria = async (citaId: number, historiaClinicaId: number) => {
  const cita = await prisma.tbl_cita.findUnique({ where: { cita_id: citaId } });
  if (!cita) {
    throw { status: 404, message: "Cita no encontrada" };
  }
  if (cita.historia_clinica_id !== historiaClinicaId) {
    throw { status: 400, message: "La cita no pertenece a la historia clínica indicada" };
  }
  return cita;
};

const ensureCitaSinExamen = async (citaId: number, excluirExamenId?: number) => {
  const existente = await prisma.tbl_examen_optometrico.findFirst({
    where: {
      cita_id: citaId,
      examen_estado: { not: ESTADO_INACTIVO },
      ...(excluirExamenId ? { examen_optometrico_id: { not: excluirExamenId } } : {}),
    },
  });
  if (existente) {
    throw { status: 409, message: "La cita ya tiene un examen optométrico registrado" };
  }
};

const ensureExamenEditable = async (id: number) => {
  const examen = await prisma.tbl_examen_optometrico.findUnique({ where: { examen_optometrico_id: id } });
  if (!examen) throw { status: 404, message: "Examen optométrico no encontrado" };
  if (examen.examen_estado === ESTADO_INACTIVO) throw { status: 400, message: "No se puede modificar un examen inactivo" };
  if (examen.examen_estado === ESTADO_FINALIZADO) throw { status: 400, message: "No se puede modificar un examen finalizado" };
  return examen;
};

const toCreateData = (data: ExamenOptometricoCreateInput, usuarioId?: number): Prisma.tbl_examen_optometricoCreateInput => ({
  historia_clinica: { connect: { historia_clinica_id: data.historia_clinica_id } },
  ...(data.cita_id ? { cita: { connect: { cita_id: data.cita_id } } } : {}),
  ...(data.examinador_id || usuarioId ? { examinador: { connect: { usuario_id: data.examinador_id || usuarioId! } } } : {}),
  examen_fecha: data.examen_fecha ? new Date(data.examen_fecha) : undefined,
  examen_hora: parseTime(data.examen_hora),
  examen_consultorio: data.examen_consultorio ?? null,
  examen_llave: data.examen_llave ?? null,
  examen_motivo_consulta: data.examen_motivo_consulta ?? null,
  examen_anamnesis: data.examen_anamnesis ?? null,
  antecedentes_personales_oculares: data.antecedentes_personales_oculares ?? null,
  antecedentes_personales_generales: data.antecedentes_personales_generales ?? null,
  antecedentes_familiares_oculares: data.antecedentes_familiares_oculares ?? null,
  antecedentes_familiares_generales: data.antecedentes_familiares_generales ?? null,
  ...withJsonDefaults(data),
  diagnostico_od: data.diagnostico_od ?? null,
  diagnostico_oi: data.diagnostico_oi ?? null,
  diagnostico_motor: data.diagnostico_motor ?? null,
  cie10: data.cie10 ?? null,
  patologico_presuntivo: data.patologico_presuntivo ?? null,
  tratamiento_conducta: data.tratamiento_conducta ?? null,
  consentimiento_informado: data.consentimiento_informado,
  consentimiento_firma: data.consentimiento_firma ?? null,
  examen_nombre_examinador: data.examen_nombre_examinador ?? null,
  examen_nivel_paralelo_jornada: data.examen_nivel_paralelo_jornada ?? null,
  examen_estado: ESTADO_BORRADOR,
});

const toUpdateData = (data: ExamenOptometricoUpdateInput): Prisma.tbl_examen_optometricoUpdateInput => ({
  ...(data.historia_clinica_id ? { historia_clinica: { connect: { historia_clinica_id: data.historia_clinica_id } } } : {}),
  ...(data.cita_id !== undefined ? (data.cita_id === null ? { cita: { disconnect: true } } : { cita: { connect: { cita_id: data.cita_id } } }) : {}),
  ...(data.examinador_id !== undefined ? (data.examinador_id === null ? { examinador: { disconnect: true } } : { examinador: { connect: { usuario_id: data.examinador_id } } }) : {}),
  ...(data.examen_fecha ? { examen_fecha: new Date(data.examen_fecha) } : {}),
  ...(data.examen_hora !== undefined ? { examen_hora: parseTime(data.examen_hora) } : {}),
  ...(data.examen_consultorio !== undefined ? { examen_consultorio: data.examen_consultorio } : {}),
  ...(data.examen_llave !== undefined ? { examen_llave: data.examen_llave } : {}),
  ...(data.examen_motivo_consulta !== undefined ? { examen_motivo_consulta: data.examen_motivo_consulta } : {}),
  ...(data.examen_anamnesis !== undefined ? { examen_anamnesis: data.examen_anamnesis } : {}),
  ...(data.antecedentes_personales_oculares !== undefined ? { antecedentes_personales_oculares: data.antecedentes_personales_oculares } : {}),
  ...(data.antecedentes_personales_generales !== undefined ? { antecedentes_personales_generales: data.antecedentes_personales_generales } : {}),
  ...(data.antecedentes_familiares_oculares !== undefined ? { antecedentes_familiares_oculares: data.antecedentes_familiares_oculares } : {}),
  ...(data.antecedentes_familiares_generales !== undefined ? { antecedentes_familiares_generales: data.antecedentes_familiares_generales } : {}),
  ...jsonUpdates(data),
  ...(data.diagnostico_od !== undefined ? { diagnostico_od: data.diagnostico_od } : {}),
  ...(data.diagnostico_oi !== undefined ? { diagnostico_oi: data.diagnostico_oi } : {}),
  ...(data.diagnostico_motor !== undefined ? { diagnostico_motor: data.diagnostico_motor } : {}),
  ...(data.cie10 !== undefined ? { cie10: data.cie10 } : {}),
  ...(data.patologico_presuntivo !== undefined ? { patologico_presuntivo: data.patologico_presuntivo } : {}),
  ...(data.tratamiento_conducta !== undefined ? { tratamiento_conducta: data.tratamiento_conducta } : {}),
  ...(data.consentimiento_informado !== undefined ? { consentimiento_informado: data.consentimiento_informado } : {}),
  ...(data.consentimiento_firma !== undefined ? { consentimiento_firma: data.consentimiento_firma } : {}),
  ...(data.examen_nombre_examinador !== undefined ? { examen_nombre_examinador: data.examen_nombre_examinador } : {}),
  ...(data.examen_nivel_paralelo_jornada !== undefined ? { examen_nivel_paralelo_jornada: data.examen_nivel_paralelo_jornada } : {}),
});

export const listar = async (query: unknown) => {
  const parsed = parseOrThrow(examenOptometricoQuerySchema.safeParse(query));
  const { page, limit, skip } = getPagination(parsed);
  const where: Record<string, unknown> = {};

  const historiaFilter = buildIntFilter(parsed.historia_clinica_id);
  if (historiaFilter) where.historia_clinica_id = historiaFilter;
  const citaFilter = buildIntFilter(parsed.cita_id);
  if (citaFilter) where.cita_id = citaFilter;
  const examinadorFilter = buildIntFilter(parsed.examinador_id);
  if (examinadorFilter) where.examinador_id = examinadorFilter;
  const estadoFilter = buildEstadoFilter(parsed.examen_estado);
  if (estadoFilter) where.examen_estado = estadoFilter;
  const fechaFilter = buildDateFilter(parsed.fecha);
  if (fechaFilter) where.examen_fecha = fechaFilter;

  const [examenes, total] = await Promise.all([
    prisma.tbl_examen_optometrico.findMany({ where, include: examenOptometricoInclude, skip, take: limit, orderBy: { examen_fecha: "desc" } }),
    prisma.tbl_examen_optometrico.count({ where }),
  ]);

  return paginatedResponse(examenes, total, page, limit);
};

export const listarPorHistoriaClinica = async (historiaClinicaId: number, query: unknown) => {
  await ensureHistoriaClinicaActiva(historiaClinicaId);
  return listar({ ...(query as Record<string, unknown>), historia_clinica_id: String(historiaClinicaId) });
};

export const obtenerPorId = async (id: number) => {
  return prisma.tbl_examen_optometrico.findUnique({ where: { examen_optometrico_id: id }, include: examenOptometricoInclude });
};

export const crear = async (body: unknown, usuarioId?: number) => {
  const data = parseOrThrow(examenOptometricoCreateSchema.safeParse(body));

  await ensureHistoriaClinicaActiva(data.historia_clinica_id);
  if (data.cita_id) {
    await ensureCitaPerteneceAHistoria(data.cita_id, data.historia_clinica_id);
    await ensureCitaSinExamen(data.cita_id);
  }

  return prisma.tbl_examen_optometrico.create({
    data: toCreateData(data, usuarioId),
    include: examenOptometricoInclude,
  });
};

export const actualizar = async (id: number, body: unknown) => {
  const actual = await ensureExamenEditable(id);
  const data = parseOrThrow(examenOptometricoUpdateSchema.safeParse(body));
  const historiaClinicaId = data.historia_clinica_id ?? actual.historia_clinica_id;

  if (data.historia_clinica_id) {
    await ensureHistoriaClinicaActiva(data.historia_clinica_id);
  }
  if (data.cita_id) {
    await ensureCitaPerteneceAHistoria(data.cita_id, historiaClinicaId);
    await ensureCitaSinExamen(data.cita_id, id);
  }

  return prisma.tbl_examen_optometrico.update({
    where: { examen_optometrico_id: id },
    data: toUpdateData(data),
    include: examenOptometricoInclude,
  });
};

export const finalizar = async (id: number) => {
  const examen = await prisma.tbl_examen_optometrico.findUnique({ where: { examen_optometrico_id: id } });
  if (!examen) throw { status: 404, message: "Examen optométrico no encontrado" };
  if (examen.examen_estado === ESTADO_INACTIVO) throw { status: 400, message: "No se puede finalizar un examen inactivo" };

  return prisma.tbl_examen_optometrico.update({
    where: { examen_optometrico_id: id },
    data: { examen_estado: ESTADO_FINALIZADO },
    include: examenOptometricoInclude,
  });
};

export const eliminar = async (id: number) => {
  const examen = await prisma.tbl_examen_optometrico.findUnique({ where: { examen_optometrico_id: id } });
  if (!examen) throw { status: 404, message: "Examen optométrico no encontrado" };

  return prisma.tbl_examen_optometrico.update({
    where: { examen_optometrico_id: id },
    data: { examen_estado: ESTADO_INACTIVO },
    include: examenOptometricoInclude,
  });
};
