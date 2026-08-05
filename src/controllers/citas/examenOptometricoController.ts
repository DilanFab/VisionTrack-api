import { Request, Response } from "express";
import * as examenOptometricoService from "../../services/examenOptometricoService";
import { logger } from "../../utils/logger";

const handleError = (res: Response, error: any, fallback: string) => {
  if (error?.status) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  logger.error({ err: error }, fallback);
  res.status(500).json({ error: fallback });
};

/**
 * @openapi
 * /api/examenes-optometricos:
 *   get:
 *     tags: [ExamenesOptometricos]
 *     summary: Listar exámenes optométricos (paginado)
 */
export const getExamenesOptometricos = async (req: Request, res: Response) => {
  try {
    const result = await examenOptometricoService.listar(req.query);
    res.json(result);
  } catch (error) {
    handleError(res, error, "Error al obtener exámenes optométricos");
  }
};

/**
 * @openapi
 * /api/historias-clinicas/{id}/examenes-optometricos:
 *   get:
 *     tags: [ExamenesOptometricos]
 *     summary: Listar exámenes optométricos por historia clínica
 */
export const getExamenesPorHistoriaClinica = async (req: Request, res: Response) => {
  try {
    const result = await examenOptometricoService.listarPorHistoriaClinica(Number(req.params.id), req.query);
    res.json(result);
  } catch (error) {
    handleError(res, error, "Error al obtener exámenes optométricos de la historia clínica");
  }
};

/**
 * @openapi
 * /api/examenes-optometricos/{id}:
 *   get:
 *     tags: [ExamenesOptometricos]
 *     summary: Obtener examen optométrico por ID
 */
export const getExamenOptometricoById = async (req: Request, res: Response) => {
  try {
    const examen = await examenOptometricoService.obtenerPorId(Number(req.params.id));
    if (!examen) {
      res.status(404).json({ error: "Examen optométrico no encontrado" });
      return;
    }
    res.json(examen);
  } catch (error) {
    handleError(res, error, "Error al obtener el examen optométrico");
  }
};

/**
 * @openapi
 * /api/examenes-optometricos:
 *   post:
 *     tags: [ExamenesOptometricos]
 *     summary: Crear examen optométrico
 */
export const createExamenOptometrico = async (req: Request, res: Response) => {
  try {
    const examen = await examenOptometricoService.crear(req.body, req.usuario?.usuario_id);
    res.status(201).json(examen);
  } catch (error) {
    handleError(res, error, "Error al crear el examen optométrico");
  }
};

/**
 * @openapi
 * /api/examenes-optometricos/{id}:
 *   put:
 *     tags: [ExamenesOptometricos]
 *     summary: Actualizar examen optométrico
 */
export const updateExamenOptometrico = async (req: Request, res: Response) => {
  try {
    const examen = await examenOptometricoService.actualizar(Number(req.params.id), req.body);
    res.json(examen);
  } catch (error) {
    handleError(res, error, "Error al actualizar el examen optométrico");
  }
};

/**
 * @openapi
 * /api/examenes-optometricos/{id}/finalizar:
 *   patch:
 *     tags: [ExamenesOptometricos]
 *     summary: Finalizar examen optométrico
 */
export const finalizarExamenOptometrico = async (req: Request, res: Response) => {
  try {
    const examen = await examenOptometricoService.finalizar(Number(req.params.id));
    res.json(examen);
  } catch (error) {
    handleError(res, error, "Error al finalizar el examen optométrico");
  }
};

/**
 * @openapi
 * /api/examenes-optometricos/{id}:
 *   delete:
 *     tags: [ExamenesOptometricos]
 *     summary: Desactivar examen optométrico
 */
export const deleteExamenOptometrico = async (req: Request, res: Response) => {
  try {
    const examen = await examenOptometricoService.eliminar(Number(req.params.id));
    res.json({ message: "Examen optométrico desactivado correctamente", examen });
  } catch (error) {
    handleError(res, error, "Error al desactivar el examen optométrico");
  }
};
