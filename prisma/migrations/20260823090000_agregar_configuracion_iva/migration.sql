-- Módulo de Configuración Fiscal (IVA)
-- Migración: agregar_configuracion_iva
-- NOTA: SQL idempotente — resuelve el drift entre schema.prisma y prisma/migrations
-- (los objetos ya existen en la BD actual; esta migración los documenta para
-- entornos limpios y para que futuros `migrate dev` no generen duplicados).

CREATE TABLE IF NOT EXISTS "tbl_configuracion_iva" (
    "iva_id"          SERIAL PRIMARY KEY,
    "iva_porcentaje"  DECIMAL(5,2) NOT NULL,
    "iva_descripcion" VARCHAR(100) NOT NULL,
    "iva_activo"      BOOLEAN NOT NULL DEFAULT true,
    "iva_estado"      CHAR(1) NOT NULL DEFAULT 'A',
    CONSTRAINT "tbl_configuracion_iva_iva_porcentaje_key" UNIQUE ("iva_porcentaje")
);

ALTER TABLE "tbl_producto" ADD COLUMN IF NOT EXISTS "iva_id" INTEGER;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'tbl_producto_iva_id_fkey'
    ) THEN
        ALTER TABLE "tbl_producto"
            ADD CONSTRAINT "tbl_producto_iva_id_fkey"
            FOREIGN KEY ("iva_id") REFERENCES "tbl_configuracion_iva"("iva_id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
