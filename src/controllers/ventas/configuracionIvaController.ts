import { Request, Response } from "express";
import prisma from "../../config/prisma";

// ─── GET /api/configuracion-iva ──────────────────────────────────────────────
// Público — la app de facturación lo necesita al cargar para listar tarifas disponibles
export const getConfiguracionesIva = async (req: Request, res: Response): Promise<void> => {
  try {
    const { soloActivos } = req.query;

    const where: any = { iva_estado: "A" };
    if (soloActivos === "true") {
      where.iva_activo = true;
    }

    const tarifas = await prisma.tbl_configuracion_iva.findMany({
      where,
      orderBy: { iva_porcentaje: "asc" },
    });

    res.json({ success: true, data: tarifas });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error al obtener configuraciones de IVA" });
  }
};

// ─── GET /api/configuracion-iva/:id ──────────────────────────────────────────
export const getConfiguracionIvaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const tarifa = await prisma.tbl_configuracion_iva.findFirst({
      where: { iva_id: Number(id), iva_estado: "A" },
    });

    if (!tarifa) {
      res.status(404).json({ success: false, message: "Configuración de IVA no encontrada" });
      return;
    }

    res.json({ success: true, data: tarifa });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error al obtener la configuración" });
  }
};

// ─── POST /api/configuracion-iva ─────────────────────────────────────────────
// Solo Admin
export const createConfiguracionIva = async (req: Request, res: Response): Promise<void> => {
  try {
    const { iva_porcentaje, iva_descripcion, iva_activo } = req.body as {
      iva_porcentaje: number;
      iva_descripcion: string;
      iva_activo?: boolean;
    };

    if (iva_porcentaje === undefined || !iva_descripcion) {
      res.status(400).json({ success: false, message: "Se requieren iva_porcentaje e iva_descripcion" });
      return;
    }

    if (Number(iva_porcentaje) < 0 || Number(iva_porcentaje) > 100) {
      res.status(400).json({ success: false, message: "El porcentaje de IVA debe estar entre 0 y 100" });
      return;
    }

    const nuevaTarifa = await prisma.tbl_configuracion_iva.create({
      data: {
        iva_porcentaje: Number(iva_porcentaje),
        iva_descripcion: iva_descripcion.trim(),
        iva_activo: iva_activo !== undefined ? Boolean(iva_activo) : true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Tarifa de IVA creada exitosamente",
      data: nuevaTarifa,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(400).json({ success: false, message: "Ya existe una tarifa con ese porcentaje" });
      return;
    }
    res.status(500).json({ success: false, message: error.message || "Error al crear la tarifa de IVA" });
  }
};

// ─── PUT /api/configuracion-iva/:id ──────────────────────────────────────────
// Solo Admin — permite cambiar descripción y activar/desactivar (ej. para feriados)
export const updateConfiguracionIva = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { iva_descripcion, iva_activo, iva_porcentaje } = req.body as {
      iva_descripcion?: string;
      iva_activo?: boolean;
      iva_porcentaje?: number;
    };

    const existing = await prisma.tbl_configuracion_iva.findFirst({
      where: { iva_id: Number(id), iva_estado: "A" },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: "Configuración de IVA no encontrada" });
      return;
    }

    if (iva_porcentaje !== undefined && (Number(iva_porcentaje) < 0 || Number(iva_porcentaje) > 100)) {
      res.status(400).json({ success: false, message: "El porcentaje de IVA debe estar entre 0 y 100" });
      return;
    }

    const updateData: any = {};
    if (iva_descripcion !== undefined) updateData.iva_descripcion = iva_descripcion.trim();
    if (iva_activo !== undefined)      updateData.iva_activo      = Boolean(iva_activo);
    if (iva_porcentaje !== undefined)  updateData.iva_porcentaje  = Number(iva_porcentaje);

    const tarifa = await prisma.tbl_configuracion_iva.update({
      where: { iva_id: Number(id) },
      data: updateData,
    });

    res.json({ success: true, message: "Tarifa de IVA actualizada", data: tarifa });
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(400).json({ success: false, message: "Ya existe una tarifa con ese porcentaje" });
      return;
    }
    res.status(500).json({ success: false, message: error.message || "Error al actualizar la tarifa de IVA" });
  }
};

// ─── DELETE /api/configuracion-iva/:id ───────────────────────────────────────
// Solo Admin — borrado lógico
export const deleteConfiguracionIva = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.tbl_configuracion_iva.findFirst({
      where: { iva_id: Number(id), iva_estado: "A" },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: "Configuración de IVA no encontrada" });
      return;
    }

    await prisma.tbl_configuracion_iva.update({
      where: { iva_id: Number(id) },
      data: { iva_estado: "I", iva_activo: false },
    });

    res.json({ success: true, message: "Tarifa de IVA eliminada correctamente" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error al eliminar la tarifa de IVA" });
  }
};
