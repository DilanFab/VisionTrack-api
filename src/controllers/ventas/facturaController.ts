import { Request, Response } from "express";
import prisma from "../../config/prisma";

// ─── Tipos helpers ───────────────────────────────────────────────────────────
interface DetalleInput {
  producto_id?: number | null;
  detalle_concepto: string;
  detalle_cantidad: number;
  detalle_precio_unit: number;
  detalle_tarifa_iva: number; // porcentaje validado contra tbl_configuracion_iva
}

// Genera número de factura secuencial: FAC-00001
const generarNumeroFactura = async (): Promise<string> => {
  const ultima = await prisma.tbl_factura.findFirst({
    orderBy: { factura_id: "desc" },
    select: { factura_numero: true },
  });
  if (!ultima) return "FAC-00001";
  const num = parseInt(ultima.factura_numero.split("-")[1] ?? "0", 10) + 1;
  return `FAC-${String(num).padStart(5, "0")}`;
};

// ─── GET /api/facturas ────────────────────────────────────────────────────────
export const getFacturas = async (req: Request, res: Response): Promise<void> => {
  try {
    const facturas = await prisma.tbl_factura.findMany({
      include: {
        cliente: {
          select: {
            persona_id: true,
            persona_cedula: true,
            persona_primer_nombre: true,
            persona_primer_apellido: true,
            persona_correo: true,
            persona_telefono: true,
          },
        },
        detalles: {
          include: { producto: { select: { producto_nombre: true, producto_codigo: true } } },
        },
      },
      orderBy: { factura_fecha: "desc" },
    });
    res.json({ success: true, data: facturas });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error al obtener facturas" });
  }
};

// ─── GET /api/facturas/:id ────────────────────────────────────────────────────
export const getFacturaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const factura = await prisma.tbl_factura.findUnique({
      where: { factura_id: Number(id) },
      include: {
        cliente: true,
        detalles: { include: { producto: true } },
      },
    });
    if (!factura) {
      res.status(404).json({ success: false, message: "Factura no encontrada" });
      return;
    }
    res.json({ success: true, data: factura });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error al buscar factura" });
  }
};

// ─── POST /api/facturas ───────────────────────────────────────────────────────
export const createFactura = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cliente_id, metodo_pago, factura_notas, detalles } = req.body as {
      cliente_id: number;
      metodo_pago: string;
      factura_notas?: string;
      detalles: DetalleInput[];
    };

    if (!cliente_id || !detalles || detalles.length === 0) {
      res.status(400).json({ success: false, message: "Se requiere cliente y al menos un detalle" });
      return;
    }

    // Validar que el cliente exista
    const cliente = await prisma.tbl_persona.findUnique({ where: { persona_id: Number(cliente_id) } });
    if (!cliente) {
      res.status(404).json({ success: false, message: "Cliente no encontrado" });
      return;
    }

    // Obtener todas las tarifas de IVA activas desde la BD
    const tarifasActivas = await prisma.tbl_configuracion_iva.findMany({
      where: { iva_activo: true, iva_estado: "A" },
      select: { iva_porcentaje: true },
    });
    const porcentajesPermitidos = tarifasActivas.map((t) => Number(t.iva_porcentaje));

    // Validar que todos los detalles usen tarifas activas
    for (const d of detalles) {
      if (!porcentajesPermitidos.includes(Number(d.detalle_tarifa_iva))) {
        res.status(400).json({
          success: false,
          message: `La tarifa de IVA ${d.detalle_tarifa_iva}% no está activa. Tarifas disponibles: ${porcentajesPermitidos.join("%, ")}%`,
        });
        return;
      }
    }

    // Acumuladores para los totales por tarifa
    let sub0 = 0, sub5 = 0, sub8 = 0, sub15 = 0;
    let iva5 = 0, iva8 = 0, iva15 = 0;

    // Calcular valores por detalle
    const detallesCalculados = detalles.map((d) => {
      const cantidad = Number(d.detalle_cantidad);
      const precioUnit = Number(d.detalle_precio_unit);
      const tarifa = d.detalle_tarifa_iva ?? 15;
      const subtotal = parseFloat((cantidad * precioUnit).toFixed(2));
      const ivaValor = parseFloat((subtotal * (tarifa / 100)).toFixed(2));
      const total = parseFloat((subtotal + ivaValor).toFixed(2));

      if (tarifa === 0)  sub0  += subtotal;
      if (tarifa === 5)  { sub5  += subtotal; iva5  += ivaValor; }
      if (tarifa === 8)  { sub8  += subtotal; iva8  += ivaValor; }
      if (tarifa === 15) { sub15 += subtotal; iva15 += ivaValor; }

      return {
        producto_id: d.producto_id ?? null,
        detalle_concepto: d.detalle_concepto.trim(),
        detalle_cantidad: cantidad,
        detalle_precio_unit: precioUnit,
        detalle_tarifa_iva: tarifa,
        detalle_iva_valor: ivaValor,
        detalle_subtotal: subtotal,
        detalle_total: total,
      };
    });

    const totalGeneral = parseFloat(
      (sub0 + sub5 + sub8 + sub15 + iva5 + iva8 + iva15).toFixed(2)
    );

    const numeroFactura = await generarNumeroFactura();

    // Ejecutar en transacción: crear factura + descontar stock de productos
    const factura = await prisma.$transaction(async (tx) => {
      // A. Crear la factura con sus detalles
      const nuevaFactura = await tx.tbl_factura.create({
        data: {
          cliente_id: Number(cliente_id),
          factura_numero: numeroFactura,
          metodo_pago: metodo_pago || "Efectivo",
          factura_notas: factura_notas || null,
          subtotal_iva_0: sub0,
          subtotal_iva_5: sub5,
          subtotal_iva_8: sub8,
          subtotal_iva_15: sub15,
          iva_5: iva5,
          iva_8: iva8,
          iva_15: iva15,
          total: totalGeneral,
          detalles: { create: detallesCalculados },
        },
        include: {
          cliente: true,
          detalles: { include: { producto: true } },
        },
      });

      // B. Descontar stock de productos del inventario
      for (const d of detallesCalculados) {
        if (d.producto_id) {
          const producto = await tx.tbl_producto.findUnique({
            where: { producto_id: d.producto_id },
          });
          if (!producto) continue;

          await tx.tbl_producto.update({
            where: { producto_id: d.producto_id },
            data: { producto_stock_actual: { decrement: d.detalle_cantidad } },
          });

          // Registrar movimiento de inventario tipo SALIDA
          await tx.tbl_movimiento_inventario.create({
            data: {
              producto_id: d.producto_id,
              usuario_id: (req as any).user?.usuario_id ?? 1, // del token JWT si existe
              movimiento_tipo: "SALIDA",
              movimiento_cantidad: d.detalle_cantidad,
              movimiento_motivo: `Venta - ${nuevaFactura.factura_numero}`,
            },
          });
        }
      }

      return nuevaFactura;
    });

    res.status(201).json({
      success: true,
      message: `Factura ${factura.factura_numero} creada exitosamente`,
      data: factura,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(400).json({ success: false, message: "Error al generar número de factura, intente de nuevo" });
      return;
    }
    res.status(500).json({ success: false, message: error.message || "Error al crear la factura" });
  }
};

// ─── PATCH /api/facturas/:id/anular ──────────────────────────────────────────
export const anularFactura = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const factura = await prisma.tbl_factura.findUnique({
      where: { factura_id: Number(id) },
      include: { detalles: true },
    });

    if (!factura) {
      res.status(404).json({ success: false, message: "Factura no encontrada" });
      return;
    }
    if (factura.factura_estado === "I") {
      res.status(400).json({ success: false, message: "La factura ya está anulada" });
      return;
    }

    // Revertir stock en transacción
    await prisma.$transaction(async (tx) => {
      await tx.tbl_factura.update({
        where: { factura_id: Number(id) },
        data: { factura_estado: "I" },
      });

      for (const d of factura.detalles) {
        if (d.producto_id) {
          await tx.tbl_producto.update({
            where: { producto_id: d.producto_id },
            data: { producto_stock_actual: { increment: d.detalle_cantidad } },
          });
          await tx.tbl_movimiento_inventario.create({
            data: {
              producto_id: d.producto_id,
              usuario_id: (req as any).user?.usuario_id ?? 1,
              movimiento_tipo: "ENTRADA",
              movimiento_cantidad: d.detalle_cantidad,
              movimiento_motivo: `Anulación - ${factura.factura_numero}`,
            },
          });
        }
      }
    });

    res.json({ success: true, message: `Factura ${factura.factura_numero} anulada y stock revertido` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error al anular la factura" });
  }
};

// ─── GET /api/facturas/resumen ───────────────────────────────────────────────
export const getResumenVentas = async (req: Request, res: Response): Promise<void> => {
  try {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const [totalMes, cantidadMes, totalHoy, cantidadHoy] = await Promise.all([
      prisma.tbl_factura.aggregate({
        _sum: { total: true },
        where: { factura_estado: "A", factura_fecha: { gte: inicioMes } },
      }),
      prisma.tbl_factura.count({
        where: { factura_estado: "A", factura_fecha: { gte: inicioMes } },
      }),
      prisma.tbl_factura.aggregate({
        _sum: { total: true },
        where: {
          factura_estado: "A",
          factura_fecha: {
            gte: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()),
          },
        },
      }),
      prisma.tbl_factura.count({
        where: {
          factura_estado: "A",
          factura_fecha: {
            gte: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()),
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        ventas_hoy: { total: totalHoy._sum.total ?? 0, cantidad: cantidadHoy },
        ventas_mes: { total: totalMes._sum.total ?? 0, cantidad: cantidadMes },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error al obtener resumen" });
  }
};
