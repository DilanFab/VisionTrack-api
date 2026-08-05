import { z } from "zod";

const jsonSectionSchema = z.object({}).catchall(z.unknown());
const nullableText = z.string().trim().nullable().optional();
const positiveId = z.number().int().positive();
const estadoSchema = z.enum(["B", "F", "I"]);
const fechaSchema = z.string().min(1, "La fecha del examen es requerida");
const horaSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "La hora debe tener formato HH:mm o HH:mm:ss")
  .nullable()
  .optional();

export const examenOptometricoCreateSchema = z.object({
  historia_clinica_id: positiveId,
  cita_id: positiveId.nullable().optional(),
  examinador_id: positiveId.nullable().optional(),
  examen_fecha: fechaSchema.optional(),
  examen_hora: horaSchema,
  examen_consultorio: nullableText,
  examen_llave: nullableText,
  examen_motivo_consulta: nullableText,
  examen_anamnesis: nullableText,
  antecedentes_personales_oculares: nullableText,
  antecedentes_personales_generales: nullableText,
  antecedentes_familiares_oculares: nullableText,
  antecedentes_familiares_generales: nullableText,
  lensometria: jsonSectionSchema.optional(),
  agudeza_visual: jsonSectionSchema.optional(),
  biomicroscopia: jsonSectionSchema.optional(),
  reflejos_pupilares: jsonSectionSchema.optional(),
  oftalmoscopia: jsonSectionSchema.optional(),
  examen_motor: jsonSectionSchema.optional(),
  queratometria: jsonSectionSchema.optional(),
  refraccion: jsonSectionSchema.optional(),
  diagnostico_od: nullableText,
  diagnostico_oi: nullableText,
  diagnostico_motor: nullableText,
  cie10: z.string().trim().max(20, "El código CIE10 no puede superar 20 caracteres").nullable().optional(),
  patologico_presuntivo: nullableText,
  tratamiento_conducta: nullableText,
  consentimiento_informado: z.boolean().optional().default(false),
  consentimiento_firma: nullableText,
  examen_nombre_examinador: nullableText,
  examen_nivel_paralelo_jornada: nullableText,
}).strict();

export const examenOptometricoUpdateSchema = examenOptometricoCreateSchema
  .omit({ consentimiento_informado: true })
  .extend({ consentimiento_informado: z.boolean().optional() })
  .partial()
  .strict();

export const examenOptometricoQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  historia_clinica_id: z.string().optional(),
  cita_id: z.string().optional(),
  examinador_id: z.string().optional(),
  examen_estado: estadoSchema.optional(),
  fecha: z.string().optional(),
}).strict();

export const finalizarExamenOptometricoSchema = z.object({}).strict();

export type ExamenOptometricoCreateInput = z.infer<typeof examenOptometricoCreateSchema>;
export type ExamenOptometricoUpdateInput = z.infer<typeof examenOptometricoUpdateSchema>;
export type ExamenOptometricoQueryInput = z.infer<typeof examenOptometricoQuerySchema>;
