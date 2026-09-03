export interface DetalleCalculo {
  detalle_cantidad: number;
  detalle_precio_unit: number;
  detalle_tarifa_iva: number;
}

export interface ProductoConIva {
  configuracion_iva?: {
    iva_porcentaje: number | { toNumber: () => number };
  } | null;
}

export interface TotalPorTarifa {
  subtotal_iva_0: number;
  subtotal_iva_5: number;
  subtotal_iva_8: number;
  subtotal_iva_15: number;
  iva_5: number;
  iva_8: number;
  iva_15: number;
  total: number;
}

export const TARIFAS_IVA_DISPONIBLES = [0, 5, 8, 15] as const;

// Si el producto tiene una tarifa de IVA configurada en la BD, se fuerza esa
// tarifa sobre cualquier valor enviado por el cliente. En caso contrario se usa
// la tarifa solicitada (o 15% por defecto).
export const resolverTarifaEfectiva = (
  tarifaSolicitada: number,
  producto: ProductoConIva | null | undefined
): number => {
  const iva = producto?.configuracion_iva?.iva_porcentaje;
  if (iva !== undefined && iva !== null) {
    const tarifa = typeof iva === "number" ? iva : iva.toNumber();
    return Number(tarifa);
  }
  return tarifaSolicitada;
};

export const esTarifaIvaActiva = (
  tarifa: number,
  porcentajesPermitidos: number[]
): boolean => porcentajesPermitidos.includes(tarifa);

// Calcula los valores de un detalle (subtotal, IVA y total) aplicando la tarifa.
export const calcularDetalle = (d: DetalleCalculo) => {
  const cantidad = Number(d.detalle_cantidad);
  const precioUnit = Number(d.detalle_precio_unit);
  const tarifa = Number(d.detalle_tarifa_iva);
  const subtotal = parseFloat((cantidad * precioUnit).toFixed(2));
  const ivaValor = parseFloat((subtotal * (tarifa / 100)).toFixed(2));
  const total = parseFloat((subtotal + ivaValor).toFixed(2));
  return { cantidad, precioUnit, subtotal, ivaValor, total };
};

// Acumula los totales de una factura agrupándolos por tarifa de IVA.
export const calcularTotalesPorTarifa = (detalles: DetalleCalculo[]): TotalPorTarifa => {
  let sub0 = 0, sub5 = 0, sub8 = 0, sub15 = 0;
  let iva5 = 0, iva8 = 0, iva15 = 0;

  for (const d of detalles) {
    const { subtotal, ivaValor } = calcularDetalle(d);
    const tarifa = Number(d.detalle_tarifa_iva);
    if (tarifa === 0) sub0 += subtotal;
    if (tarifa === 5) { sub5 += subtotal; iva5 += ivaValor; }
    if (tarifa === 8) { sub8 += subtotal; iva8 += ivaValor; }
    if (tarifa === 15) { sub15 += subtotal; iva15 += ivaValor; }
  }

  const total = parseFloat(
    (sub0 + sub5 + sub8 + sub15 + iva5 + iva8 + iva15).toFixed(2)
  );

  return {
    subtotal_iva_0: sub0,
    subtotal_iva_5: sub5,
    subtotal_iva_8: sub8,
    subtotal_iva_15: sub15,
    iva_5: iva5,
    iva_8: iva8,
    iva_15: iva15,
    total,
  };
};
