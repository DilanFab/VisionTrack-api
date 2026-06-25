-- AlterTable
ALTER TABLE "tbl_menu" ALTER COLUMN "menu_padre" SET DEFAULT NULL;

-- CreateTable
CREATE TABLE "tbl_especialidad_medica" (
    "especialidad_medica_id" SERIAL NOT NULL,
    "especialidad_medica_nombre" VARCHAR(100) NOT NULL,
    "especialidad_medica_descripcion" VARCHAR(500) NOT NULL,
    "especialidad_medica_estado" CHAR(1) NOT NULL DEFAULT 'A',

    CONSTRAINT "tbl_especialidad_medica_pkey" PRIMARY KEY ("especialidad_medica_id")
);
