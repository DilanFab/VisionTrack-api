import prisma from "../config/prisma";

const money = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) throw { status: 400, message: "Los valores monetarios deben ser números no negativos" };
  return parsed;
};

export const obtenerAbierta = async () => prisma.tbl_caja.findFirst({
  where: { caja_estado: "ABIERTA" },
  include: { usuario_apertura: { include: { persona: true } }, movimientos: true },
  orderBy: { caja_fecha_apertura: "desc" },
});

export const listar = async () => prisma.tbl_caja.findMany({
  include: { usuario_apertura: { include: { persona: true } }, usuario_cierre: { include: { persona: true } } },
  orderBy: { caja_fecha_apertura: "desc" },
});

export const abrir = async (usuarioId: number, montoInicial: unknown, observacion?: string) => {
  const monto = money(montoInicial);
  const abierta = await obtenerAbierta();
  if (abierta) throw { status: 409, message: "Ya existe una caja abierta" };
  return prisma.tbl_caja.create({
    data: { usuario_apertura_id: usuarioId, caja_monto_inicial: monto, caja_observacion: observacion?.trim() || null },
  });
};

export const registrarMovimiento = async (usuarioId: number, data: { tipo: string; monto: unknown; metodo_pago?: string; observacion?: string }) => {
  const caja = await obtenerAbierta();
  if (!caja) throw { status: 409, message: "No existe una caja abierta" };
  const monto = money(data.monto);
  if (!data.tipo?.trim()) throw { status: 400, message: "El tipo de movimiento es obligatorio" };
  return prisma.tbl_movimiento_caja.create({
    data: { caja_id: caja.caja_id, usuario_id: usuarioId, tipo: data.tipo.trim().toUpperCase(), monto, metodo_pago: data.metodo_pago || null, observacion: data.observacion?.trim() || null },
  });
};

export const cerrar = async (usuarioId: number, id: number, data: { efectivo_contado: unknown; monto_vueltos?: unknown; monto_banco?: unknown; observacion: string }) => {
  const efectivoContado = money(data.efectivo_contado);
  const montoVueltos = money(data.monto_vueltos ?? 0);
  const montoBanco = money(data.monto_banco ?? 0);
  if (!data.observacion?.trim()) throw { status: 400, message: "La observación de cierre es obligatoria" };

  const caja = await prisma.tbl_caja.findUnique({ where: { caja_id: id } });
  if (!caja) throw { status: 404, message: "Caja no encontrada" };
  if (caja.caja_estado !== "ABIERTA") throw { status: 409, message: "La caja ya está cerrada" };

  const ventas = await prisma.tbl_factura.groupBy({
    by: ["metodo_pago"],
    where: { caja_id: id, factura_estado: "A" },
    _sum: { total: true },
  });
  const totalPor = (metodo: string) => Number(ventas.find((v) => v.metodo_pago === metodo)?._sum.total ?? 0);
  const efectivo = totalPor("Efectivo");
  const tarjeta = totalPor("Tarjeta");
  const transferencia = totalPor("Transferencia");
  const total = efectivo + tarjeta + transferencia;
  const esperado = Number(caja.caja_monto_inicial) + efectivo - montoBanco;
  const diferencia = efectivoContado - esperado;

  return prisma.$transaction(async (tx) => {
    const actualizada = await tx.tbl_caja.update({
      where: { caja_id: id },
      data: {
        usuario_cierre_id: usuarioId,
        caja_fecha_cierre: new Date(),
        caja_total_efectivo: efectivo,
        caja_total_tarjeta: tarjeta,
        caja_total_transferencia: transferencia,
        caja_total_ventas: total,
        caja_monto_vueltos: montoVueltos,
        caja_monto_banco: montoBanco,
        caja_efectivo_contado: efectivoContado,
        caja_diferencia: diferencia,
        caja_observacion: data.observacion.trim(),
        caja_estado: "CERRADA",
      },
    });
    if (montoBanco > 0) await tx.tbl_movimiento_caja.create({ data: { caja_id: id, usuario_id: usuarioId, tipo: "RETIRO_BANCO", monto: montoBanco, observacion: data.observacion.trim() } });
    if (montoVueltos > 0) await tx.tbl_movimiento_caja.create({ data: { caja_id: id, usuario_id: usuarioId, tipo: "VUELTO", monto: montoVueltos, observacion: data.observacion.trim() } });
    return { ...actualizada, resumen: { esperado, diferencia, efectivo, tarjeta, transferencia, total } };
  });
};
