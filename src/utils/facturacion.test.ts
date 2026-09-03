import {
  resolverTarifaEfectiva,
  esTarifaIvaActiva,
  calcularDetalle,
  calcularTotalesPorTarifa,
} from "./facturacion";

describe("facturacion utils — tarifa IVA", () => {
  describe("resolverTarifaEfectiva", () => {
    it("fuerza la tarifa configurada en el producto cuando existe", () => {
      const producto = { configuracion_iva: { iva_porcentaje: 8 } };
      expect(resolverTarifaEfectiva(15, producto)).toBe(8);
    });

    it("fuerza la tarifa aunque el producto esté configurado con Decimal (BD)", () => {
      const producto = { configuracion_iva: { iva_porcentaje: { toNumber: () => 5 } } };
      expect(resolverTarifaEfectiva(15, producto)).toBe(5);
    });

    it("usa la tarifa solicitada si el producto no tiene IVA configurado", () => {
      const producto = { configuracion_iva: null };
      expect(resolverTarifaEfectiva(5, producto)).toBe(5);
    });

    it("usa la tarifa solicitada si no hay producto", () => {
      expect(resolverTarifaEfectiva(0, null)).toBe(0);
      expect(resolverTarifaEfectiva(0, undefined)).toBe(0);
    });

    it("usa la tarifa solicitada si el producto existe pero no incluye configuracion_iva", () => {
      expect(resolverTarifaEfectiva(15, {})).toBe(15);
    });
  });

  describe("esTarifaIvaActiva", () => {
    it("retorna true si la tarifa está entre las permitidas", () => {
      expect(esTarifaIvaActiva(8, [0, 5, 8, 15])).toBe(true);
    });

    it("retorna false si la tarifa no está permitida", () => {
      expect(esTarifaIvaActiva(12, [0, 5, 8, 15])).toBe(false);
    });
  });

  describe("calcularDetalle y totales", () => {
    it("calcula subtotal, IVA y total por detalle", () => {
      const r = calcularDetalle({ detalle_cantidad: 2, detalle_precio_unit: 100, detalle_tarifa_iva: 15 });
      expect(r.subtotal).toBe(200);
      expect(r.ivaValor).toBe(30);
      expect(r.total).toBe(230);
    });

    it("acumula totales agrupados por tarifa e IVA", () => {
      const totales = calcularTotalesPorTarifa([
        { detalle_cantidad: 1, detalle_precio_unit: 100, detalle_tarifa_iva: 0 },
        { detalle_cantidad: 1, detalle_precio_unit: 100, detalle_tarifa_iva: 5 },
        { detalle_cantidad: 1, detalle_precio_unit: 100, detalle_tarifa_iva: 8 },
        { detalle_cantidad: 1, detalle_precio_unit: 100, detalle_tarifa_iva: 15 },
      ]);
      expect(totales.subtotal_iva_0).toBe(100);
      expect(totales.subtotal_iva_5).toBe(100);
      expect(totales.iva_5).toBe(5);
      expect(totales.iva_8).toBe(8);
      expect(totales.iva_15).toBe(15);
      expect(totales.total).toBe(100 + 105 + 108 + 115);
    });
  });
});
