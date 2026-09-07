CREATE TABLE "tbl_proveedor" (
  "proveedor_id" SERIAL NOT NULL,
  "proveedor_ruc" VARCHAR(20) NOT NULL,
  "proveedor_nombre" VARCHAR(150) NOT NULL,
  "proveedor_telefono" VARCHAR(30),
  "proveedor_correo" VARCHAR(150),
  "proveedor_estado" CHAR(1) NOT NULL DEFAULT 'A',
  CONSTRAINT "tbl_proveedor_pkey" PRIMARY KEY ("proveedor_id")
);
CREATE UNIQUE INDEX "tbl_proveedor_proveedor_ruc_key" ON "tbl_proveedor"("proveedor_ruc");

CREATE TABLE "tbl_compra" (
  "compra_id" SERIAL NOT NULL,
  "proveedor_id" INTEGER NOT NULL,
  "usuario_id" INTEGER NOT NULL,
  "compra_numero" VARCHAR(30) NOT NULL,
  "compra_fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "compra_metodo_pago" VARCHAR(50) NOT NULL DEFAULT 'Efectivo',
  "compra_subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "compra_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "compra_estado" CHAR(1) NOT NULL DEFAULT 'A',
  "compra_observacion" VARCHAR(500),
  CONSTRAINT "tbl_compra_pkey" PRIMARY KEY ("compra_id")
);
CREATE UNIQUE INDEX "tbl_compra_compra_numero_key" ON "tbl_compra"("compra_numero");
CREATE INDEX "tbl_compra_compra_fecha_idx" ON "tbl_compra"("compra_fecha");
ALTER TABLE "tbl_compra" ADD CONSTRAINT "tbl_compra_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "tbl_proveedor"("proveedor_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tbl_compra" ADD CONSTRAINT "tbl_compra_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "tbl_usuario"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "tbl_detalle_compra" (
  "detalle_compra_id" SERIAL NOT NULL,
  "compra_id" INTEGER NOT NULL,
  "producto_id" INTEGER NOT NULL,
  "cantidad" INTEGER NOT NULL,
  "precio_unitario" DECIMAL(10,2) NOT NULL,
  "subtotal" DECIMAL(10,2) NOT NULL,
  CONSTRAINT "tbl_detalle_compra_pkey" PRIMARY KEY ("detalle_compra_id")
);
ALTER TABLE "tbl_detalle_compra" ADD CONSTRAINT "tbl_detalle_compra_compra_id_fkey" FOREIGN KEY ("compra_id") REFERENCES "tbl_compra"("compra_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tbl_detalle_compra" ADD CONSTRAINT "tbl_detalle_compra_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "tbl_producto"("producto_id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "tbl_abono_factura" (
  "abono_id" SERIAL NOT NULL,
  "factura_id" INTEGER NOT NULL,
  "usuario_id" INTEGER NOT NULL,
  "monto" DECIMAL(10,2) NOT NULL,
  "metodo_pago" VARCHAR(50) NOT NULL,
  "observacion" VARCHAR(500),
  "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tbl_abono_factura_pkey" PRIMARY KEY ("abono_id")
);
CREATE INDEX "tbl_abono_factura_factura_id_idx" ON "tbl_abono_factura"("factura_id");
ALTER TABLE "tbl_abono_factura" ADD CONSTRAINT "tbl_abono_factura_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "tbl_factura"("factura_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tbl_abono_factura" ADD CONSTRAINT "tbl_abono_factura_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "tbl_usuario"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "tbl_nota_credito" (
  "nota_credito_id" SERIAL NOT NULL,
  "factura_id" INTEGER NOT NULL,
  "usuario_id" INTEGER NOT NULL,
  "nota_credito_numero" VARCHAR(30) NOT NULL,
  "monto" DECIMAL(10,2) NOT NULL,
  "motivo" VARCHAR(500) NOT NULL,
  "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tbl_nota_credito_pkey" PRIMARY KEY ("nota_credito_id")
);
CREATE UNIQUE INDEX "tbl_nota_credito_nota_credito_numero_key" ON "tbl_nota_credito"("nota_credito_numero");
CREATE INDEX "tbl_nota_credito_factura_id_idx" ON "tbl_nota_credito"("factura_id");
ALTER TABLE "tbl_nota_credito" ADD CONSTRAINT "tbl_nota_credito_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "tbl_factura"("factura_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tbl_nota_credito" ADD CONSTRAINT "tbl_nota_credito_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "tbl_usuario"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;
