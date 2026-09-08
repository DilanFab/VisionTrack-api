import { Request, Response } from "express";
import prisma from "../config/prisma";
const rango = (req: Request) => {
  const desde = req.query.desde ? new Date(String(req.query.desde)) : new Date("2000-01-01");
  const hasta = req.query.hasta ? new Date(`${String(req.query.hasta)}T23:59:59.999`) : new Date();
  return { gte: desde, lte: hasta };
};

const fail = (res: Response, e: any) =>
  res.status(500).json({ error: e?.message ?? "Error al generar reporte" });

export const reporteVentas = async (req: Request, res: Response) => {
  try {
    const data = await prisma.tbl_factura.findMany({
      where: { factura_fecha: rango(req), factura_estado: "A" },
      select: {
        factura_id: true,
        factura_numero: true,
        factura_fecha: true,
        metodo_pago: true,
        subtotal: true,
        total_iva: true,
        total: true,
        cliente: {
          select: {
            persona_cedula: true,
            persona_primer_nombre: true,
            persona_segundo_nombre: true,
            persona_primer_apellido: true,
            persona_segundo_apellido: true,
          },
        },
      },
      orderBy: { factura_fecha: "desc" },
    });

    const totalVentas = data.reduce((s, x) => s + Number(x.total), 0);
    res.json({
      filtros: req.query,
      total: totalVentas,
      cantidad: data.length,
      datos: data,
    });
  } catch (e) {
    fail(res, e);
  }
};

export const reporteCompras = async (req: Request, res: Response) => {
  try {
    const data = await prisma.tbl_compra.findMany({
      where: { compra_fecha: rango(req), compra_estado: "A" },
      include: {
        proveedor: true,
        detalles: {
          include: {
            producto: true,
          },
        },
      },
      orderBy: { compra_fecha: "desc" },
    });

    const totalCompras = data.reduce((s, x) => s + Number(x.compra_total), 0);
    res.json({
      filtros: req.query,
      total: totalCompras,
      cantidad: data.length,
      datos: data,
    });
  } catch (e) {
    fail(res, e);
  }
};

export const reporteInventario = async (_req: Request, res: Response) => {
  try {
    const datos = await prisma.tbl_producto.findMany({
      include: {
        categoria: true,
      },
      orderBy: { producto_nombre: "asc" },
    });

    const bajoStock = datos.filter(
      (p) => p.producto_stock_actual <= p.producto_stock_minimo
    );

    res.json({
      totalProductos: datos.length,
      totalBajoStock: bajoStock.length,
      bajoStock,
      datos,
    });
  } catch (e) {
    fail(res, e);
  }
};

export const reporteCitas = async (req: Request, res: Response) => {
  try {
    const datos = await prisma.tbl_cita.findMany({
      where: { cita_fecha: rango(req) },
      include: {
        estado_cita: true,
        historia_clinica: {
          include: {
            perfil: {
              include: {
                usuario: {
                  include: { persona: true },
                },
              },
            },
          },
        },
        horario_doctor: {
          include: {
            doctor: {
              include: {
                especialidad_medica: true,
                perfil: {
                  include: {
                    usuario: {
                      include: { persona: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { cita_fecha: "desc" },
    });

    res.json({ filtros: req.query, cantidad: datos.length, datos });
  } catch (e) {
    fail(res, e);
  }
};

// Reporte de citas agrupadas por estado (Atendidas, Canceladas, Programadas, Reagendadas, etc.)
export const reporteCitasPorEstado = async (req: Request, res: Response) => {
  try {
    const dateRange = rango(req);
    const [citas, estados] = await Promise.all([
      prisma.tbl_cita.findMany({
        where: { cita_fecha: dateRange },
        include: {
          estado_cita: true,
          historia_clinica: {
            include: {
              perfil: {
                include: {
                  usuario: {
                    include: { persona: true },
                  },
                },
              },
            },
          },
          horario_doctor: {
            include: {
              doctor: {
                include: {
                  especialidad_medica: true,
                  perfil: {
                    include: {
                      usuario: {
                        include: { persona: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { cita_fecha: "desc" },
      }),
      prisma.tbl_estado_cita.findMany({ orderBy: { estado_cita_nombre: "asc" } }),
    ]);

    const total = citas.length;
    const porEstado: Record<string, { id: number; estado: string; color: string; cantidad: number; porcentaje: number }> = {};

    const colorMap: Record<string, string> = {
      Programada: "#3b82f6",
      Atendida: "#10b981",
      Cancelada: "#ef4444",
      Reagendada: "#f59e0b",
      Confirmada: "#8b5cf6",
    };

    estados.forEach((est) => {
      porEstado[est.estado_cita_nombre] = {
        id: est.estado_cita_id,
        estado: est.estado_cita_nombre,
        color: colorMap[est.estado_cita_nombre] || "#6b7280",
        cantidad: 0,
        porcentaje: 0,
      };
    });

    citas.forEach((c) => {
      const nombre = c.estado_cita?.estado_cita_nombre || "Sin Estado";
      if (!porEstado[nombre]) {
        porEstado[nombre] = {
          id: c.estado_cita_id,
          estado: nombre,
          color: colorMap[nombre] || "#6b7280",
          cantidad: 0,
          porcentaje: 0,
        };
      }
      porEstado[nombre].cantidad++;
    });

    Object.values(porEstado).forEach((item) => {
      item.porcentaje = total > 0 ? Number(((item.cantidad / total) * 100).toFixed(1)) : 0;
    });

    res.json({
      filtros: req.query,
      totalCitas: total,
      resumenPorEstado: Object.values(porEstado),
      datos: citas,
    });
  } catch (e) {
    fail(res, e);
  }
};

// Reporte de atenciones por médico (Citas atendidas y exámenes realizados agrupados por profesional)
export const reporteAtencionesMedico = async (req: Request, res: Response) => {
  try {
    const dateRange = rango(req);

    // Obtener doctores con su persona y especialidad
    const doctores = await prisma.tbl_doctor.findMany({
      include: {
        especialidad_medica: true,
        perfil: {
          include: {
            usuario: {
              include: { persona: true },
            },
          },
        },
      },
    });

    // Obtener todas las citas en el rango
    const citas = await prisma.tbl_cita.findMany({
      where: { cita_fecha: dateRange },
      include: {
        estado_cita: true,
        horario_doctor: true,
        historia_clinica: {
          include: {
            perfil: {
              include: {
                usuario: {
                  include: { persona: true },
                },
              },
            },
          },
        },
      },
    });

    // Obtener exámenes optométricos en el rango
    const examenes = await prisma.tbl_examen_optometrico.findMany({
      where: {
        examen_fecha: dateRange,
        examen_estado: { not: "I" },
      },
      include: {
        examinador: {
          include: { persona: true },
        },
        historia_clinica: {
          include: {
            perfil: {
              include: {
                usuario: {
                  include: { persona: true },
                },
              },
            },
          },
        },
      },
    });

    const resumenDoctores = doctores.map((doc) => {
      const p = doc.perfil?.usuario?.persona;
      const nombreCompleto = p
        ? [p.persona_primer_nombre, p.persona_segundo_nombre, p.persona_primer_apellido, p.persona_segundo_apellido]
            .filter(Boolean)
            .join(" ")
        : `Doctor #${doc.doctor_id}`;

      // Citas asignadas a este doctor
      const citasDoctor = citas.filter((c) => c.horario_doctor?.doctor_id === doc.doctor_id);
      const atendidas = citasDoctor.filter(
        (c) => c.estado_cita?.estado_cita_nombre?.toLowerCase() === "atendida"
      ).length;
      const programadas = citasDoctor.filter(
        (c) => c.estado_cita?.estado_cita_nombre?.toLowerCase() === "programada"
      ).length;
      const canceladas = citasDoctor.filter(
        (c) => c.estado_cita?.estado_cita_nombre?.toLowerCase() === "cancelada"
      ).length;

      // Exámenes realizados por este doctor (vía usuario_id)
      const examenesDoctor = examenes.filter(
        (e) => e.examinador_id === doc.perfil?.usuario_id
      ).length;

      return {
        doctor_id: doc.doctor_id,
        nombre: nombreCompleto,
        cedula: p?.persona_cedula || "N/A",
        especialidad: doc.especialidad_medica?.especialidad_medica_nombre || "General",
        totalCitas: citasDoctor.length,
        atendidas,
        programadas,
        canceladas,
        examenesRealizados: examenesDoctor,
        totalAtenciones: atendidas + examenesDoctor,
      };
    });

    // Total general de atenciones
    const totalAtenciones = resumenDoctores.reduce((s, d) => s + d.totalAtenciones, 0);

    res.json({
      filtros: req.query,
      totalAtenciones,
      totalDoctores: doctores.length,
      resumen: resumenDoctores,
      detalleCitas: citas,
      detalleExamenes: examenes,
    });
  } catch (e) {
    fail(res, e);
  }
};
