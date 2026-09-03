-- Módulo de Facturación Interna
-- Migración: agregar_modulo_facturacion

CREATE TABLE "tbl_factura" (
    "factura_id"      SERIAL PRIMARY KEY,
    "cliente_id"      INTEGER NOT NULL,
    "factura_numero"  VARCHAR(20) NOT NULL,
    "factura_fecha"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metodo_pago"     VARCHAR(50) NOT NULL DEFAULT 'Efectivo',
    "subtotal_iva_0"  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "subtotal_iva_5"  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "subtotal_iva_8"  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "subtotal_iva_15" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "iva_5"           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "iva_8"           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "iva_15"          DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "total"           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "factura_notas"   VARCHAR(500),
    "factura_estado"  CHAR(1) NOT NULL DEFAULT 'A',
    "factura_creada"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "tbl_factura_factura_numero_key" ON "tbl_factura"("factura_numero");
CREATE INDEX "tbl_factura_factura_fecha_idx" ON "tbl_factura"("factura_fecha");
CREATE INDEX "tbl_factura_factura_estado_idx" ON "tbl_factura"("factura_estado");
CREATE INDEX "tbl_factura_cliente_id_idx" ON "tbl_factura"("cliente_id");

ALTER TABLE "tbl_factura"
    ADD CONSTRAINT "tbl_factura_cliente_id_fkey"
    FOREIGN KEY ("cliente_id") REFERENCES "tbl_persona"("persona_id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE "tbl_detalle_factura" (
    "detalle_id"          SERIAL PRIMARY KEY,
    "factura_id"          INTEGER NOT NULL,
    "producto_id"         INTEGER,
    "detalle_concepto"    VARCHAR(255) NOT NULL,
    "detalle_cantidad"    INTEGER NOT NULL DEFAULT 1,
    "detalle_precio_unit" DECIMAL(10,2) NOT NULL,
    "detalle_tarifa_iva"  INTEGER NOT NULL DEFAULT 15,
    "detalle_iva_valor"   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "detalle_subtotal"    DECIMAL(10,2) NOT NULL,
    "detalle_total"       DECIMAL(10,2) NOT NULL
);

ALTER TABLE "tbl_detalle_factura"
    ADD CONSTRAINT "tbl_detalle_factura_factura_id_fkey"
    FOREIGN KEY ("factura_id") REFERENCES "tbl_factura"("factura_id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tbl_detalle_factura"
    ADD CONSTRAINT "tbl_detalle_factura_producto_id_fkey"
    FOREIGN KEY ("producto_id") REFERENCES "tbl_producto"("producto_id")
    ON DELETE SET NULL ON UPDATE CASCADE;
