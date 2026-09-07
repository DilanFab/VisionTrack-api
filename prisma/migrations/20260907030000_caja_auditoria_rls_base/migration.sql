-- Caja, auditoría clínica y relación factura-caja.
ALTER TABLE "tbl_factura" ADD COLUMN "caja_id" INTEGER;
CREATE INDEX "tbl_factura_caja_id_idx" ON "tbl_factura"("caja_id");

CREATE TABLE "tbl_caja" (
  "caja_id" SERIAL NOT NULL,
  "usuario_apertura_id" INTEGER NOT NULL,
  "usuario_cierre_id" INTEGER,
  "caja_fecha_apertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "caja_fecha_cierre" TIMESTAMP(3),
  "caja_monto_inicial" DECIMAL(10,2) NOT NULL,
  "caja_total_efectivo" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "caja_total_tarjeta" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "caja_total_transferencia" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "caja_total_ventas" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "caja_monto_vueltos" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "caja_monto_banco" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "caja_efectivo_contado" DECIMAL(10,2),
  "caja_diferencia" DECIMAL(10,2),
  "caja_observacion" VARCHAR(500),
  "caja_estado" VARCHAR(20) NOT NULL DEFAULT 'ABIERTA',
  CONSTRAINT "tbl_caja_pkey" PRIMARY KEY ("caja_id")
);
CREATE INDEX "tbl_caja_caja_estado_idx" ON "tbl_caja"("caja_estado");
CREATE INDEX "tbl_caja_caja_fecha_apertura_idx" ON "tbl_caja"("caja_fecha_apertura");
ALTER TABLE "tbl_caja" ADD CONSTRAINT "tbl_caja_usuario_apertura_id_fkey" FOREIGN KEY ("usuario_apertura_id") REFERENCES "tbl_usuario"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tbl_caja" ADD CONSTRAINT "tbl_caja_usuario_cierre_id_fkey" FOREIGN KEY ("usuario_cierre_id") REFERENCES "tbl_usuario"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "tbl_movimiento_caja" (
  "movimiento_caja_id" SERIAL NOT NULL,
  "caja_id" INTEGER NOT NULL,
  "usuario_id" INTEGER NOT NULL,
  "tipo" VARCHAR(30) NOT NULL,
  "monto" DECIMAL(10,2) NOT NULL,
  "metodo_pago" VARCHAR(30),
  "observacion" VARCHAR(500),
  "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tbl_movimiento_caja_pkey" PRIMARY KEY ("movimiento_caja_id")
);
CREATE INDEX "tbl_movimiento_caja_caja_id_idx" ON "tbl_movimiento_caja"("caja_id");
ALTER TABLE "tbl_movimiento_caja" ADD CONSTRAINT "tbl_movimiento_caja_caja_id_fkey" FOREIGN KEY ("caja_id") REFERENCES "tbl_caja"("caja_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tbl_movimiento_caja" ADD CONSTRAINT "tbl_movimiento_caja_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "tbl_usuario"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "tbl_auditoria_examen" (
  "auditoria_examen_id" SERIAL NOT NULL,
  "examen_id" INTEGER NOT NULL,
  "usuario_id" INTEGER NOT NULL,
  "autorizado_por_id" INTEGER,
  "motivo" VARCHAR(500) NOT NULL,
  "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tbl_auditoria_examen_pkey" PRIMARY KEY ("auditoria_examen_id")
);
CREATE INDEX "tbl_auditoria_examen_examen_id_idx" ON "tbl_auditoria_examen"("examen_id");
ALTER TABLE "tbl_auditoria_examen" ADD CONSTRAINT "tbl_auditoria_examen_examen_id_fkey" FOREIGN KEY ("examen_id") REFERENCES "tbl_examen_optometrico"("examen_optometrico_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tbl_auditoria_examen" ADD CONSTRAINT "tbl_auditoria_examen_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "tbl_usuario"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tbl_auditoria_examen" ADD CONSTRAINT "tbl_auditoria_examen_autorizado_por_id_fkey" FOREIGN KEY ("autorizado_por_id") REFERENCES "tbl_usuario"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "tbl_factura" ADD CONSTRAINT "tbl_factura_caja_id_fkey" FOREIGN KEY ("caja_id") REFERENCES "tbl_caja"("caja_id") ON DELETE SET NULL ON UPDATE CASCADE;
