import { Request, Response } from "express";
import prisma from "../../config/prisma";

const fail = (res: Response, e: any, fallback: string) => res.status(e?.status ?? 500).json({ error: e?.message ?? fallback });
const positiveMoney = (v: unknown) => { const n = Number(v); if (!Number.isFinite(n) || n <= 0) throw { status: 400, message: "El valor debe ser mayor a cero" }; return n; };

export const listarProveedores = async (_req: Request, res: Response) => { try { res.json(await prisma.tbl_proveedor.findMany({ where: { proveedor_estado: "A" }, orderBy: { proveedor_nombre: "asc" } })); } catch (e) { fail(res, e, "Error al listar proveedores"); } };
export const crearProveedor = async (req: Request, res: Response) => { try { const { proveedor_ruc, proveedor_nombre, proveedor_telefono, proveedor_correo } = req.body; if (!proveedor_ruc?.trim() || !proveedor_nombre?.trim()) throw { status: 400, message: "RUC y nombre son obligatorios" }; res.status(201).json(await prisma.tbl_proveedor.create({ data: { proveedor_ruc: proveedor_ruc.trim(), proveedor_nombre: proveedor_nombre.trim(), proveedor_telefono, proveedor_correo } })); } catch (e) { fail(res, e, "Error al crear proveedor"); } };

export const listarCompras = async (_req: Request, res: Response) => { try { res.json(await prisma.tbl_compra.findMany({ include: { proveedor: true, detalles: { include: { producto: true } } }, orderBy: { compra_fecha: "desc" } })); } catch (e) { fail(res, e, "Error al listar compras"); } };
export const crearCompra = async (req: Request, res: Response) => {
  try {
    const { proveedor_id, compra_numero, compra_metodo_pago, compra_observacion, detalles } = req.body;
    if (!proveedor_id || !compra_numero?.trim() || !Array.isArray(detalles) || detalles.length === 0) throw { status: 400, message: "Proveedor, número y detalles son obligatorios" };
    const calculados = detalles.map((d: any) => { const cantidad = Number(d.cantidad); const precio = positiveMoney(d.precio_unitario); if (!Number.isInteger(cantidad) || cantidad <= 0 || !d.producto_id) throw { status: 400, message: "Detalle de compra inválido" }; return { producto_id: Number(d.producto_id), cantidad, precio_unitario: precio, subtotal: cantidad * precio }; });
    const subtotal = calculados.reduce((s: number, d: any) => s + d.subtotal, 0);
    const compra = await prisma.$transaction(async (tx) => {
      const creada = await tx.tbl_compra.create({ data: { proveedor_id: Number(proveedor_id), usuario_id: req.usuario!.usuario_id, compra_numero: compra_numero.trim(), compra_metodo_pago: compra_metodo_pago || "Efectivo", compra_observacion: compra_observacion?.trim() || null, compra_subtotal: subtotal, compra_total: subtotal, detalles: { create: calculados } }, include: { proveedor: true, detalles: true } });
      for (const d of calculados) { await tx.tbl_producto.update({ where: { producto_id: d.producto_id }, data: { producto_stock_actual: { increment: d.cantidad } } }); await tx.tbl_movimiento_inventario.create({ data: { producto_id: d.producto_id, usuario_id: req.usuario!.usuario_id, movimiento_tipo: "ENTRADA", movimiento_cantidad: d.cantidad, movimiento_motivo: `Compra - ${creada.compra_numero}` } }); }
      return creada;
    });
    res.status(201).json(compra);
  } catch (e) { fail(res, e, "Error al registrar compra"); }
};

export const crearAbono = async (req: Request, res: Response) => {
  try { const facturaId = Number(req.params.id); const monto = positiveMoney(req.body.monto); const factura = await prisma.tbl_factura.findUnique({ where: { factura_id: facturaId }, include: { abonos: true, notas_credito: true } }); if (!factura) throw { status: 404, message: "Factura no encontrada" }; const pagado = factura.abonos.reduce((s, a) => s + Number(a.monto), 0); const creditos = factura.notas_credito.reduce((s, n) => s + Number(n.monto), 0); if (pagado + monto > Number(factura.total) - creditos) throw { status: 400, message: "El abono supera el saldo pendiente" }; res.status(201).json(await prisma.tbl_abono_factura.create({ data: { factura_id: facturaId, usuario_id: req.usuario!.usuario_id, monto, metodo_pago: req.body.metodo_pago || "Efectivo", observacion: req.body.observacion?.trim() || null } })); } catch (e) { fail(res, e, "Error al registrar abono"); }
};

export const crearNotaCredito = async (req: Request, res: Response) => {
  try { const facturaId = Number(req.params.id); const monto = positiveMoney(req.body.monto); if (!req.body.motivo?.trim()) throw { status: 400, message: "El motivo es obligatorio" }; const factura = await prisma.tbl_factura.findUnique({ where: { factura_id: facturaId }, include: { notas_credito: true } }); if (!factura) throw { status: 404, message: "Factura no encontrada" }; const usado = factura.notas_credito.reduce((s, n) => s + Number(n.monto), 0); if (usado + monto > Number(factura.total)) throw { status: 400, message: "Las notas de crédito superan el total de la factura" }; const numero = `NC-${Date.now()}`; res.status(201).json(await prisma.tbl_nota_credito.create({ data: { factura_id: facturaId, usuario_id: req.usuario!.usuario_id, nota_credito_numero: numero, monto, motivo: req.body.motivo.trim() } })); } catch (e) { fail(res, e, "Error al crear nota de crédito"); }
};
