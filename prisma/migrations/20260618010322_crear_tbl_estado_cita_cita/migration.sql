-- AlterTable
ALTER TABLE "tbl_menu" ALTER COLUMN "menu_padre" SET DEFAULT NULL;

-- CreateTable
CREATE TABLE "tbl_estado_cita" (
    "estado_cita_id" SERIAL NOT NULL,
    "estado_cita_nombre" VARCHAR(100) NOT NULL,
    "estado_cita_descripcion" VARCHAR(500) NOT NULL,
    "estado_cita_estado" CHAR(1) NOT NULL DEFAULT 'A',

    CONSTRAINT "tbl_estado_cita_pkey" PRIMARY KEY ("estado_cita_id")
);

-- CreateTable
CREATE TABLE "tbl_cita" (
    "cita_id" SERIAL NOT NULL,
    "horario_doctor_id" INTEGER NOT NULL,
    "historia_clinica_id" INTEGER NOT NULL,
    "cita_fecha" DATE NOT NULL,
    "cita_motivo" VARCHAR(500) NOT NULL,
    "estado_cita_id" INTEGER NOT NULL,

    CONSTRAINT "tbl_cita_pkey" PRIMARY KEY ("cita_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_estado_cita_estado_cita_nombre_key" ON "tbl_estado_cita"("estado_cita_nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_estado_cita_estado_cita_descripcion_key" ON "tbl_estado_cita"("estado_cita_descripcion");

-- AddForeignKey
ALTER TABLE "tbl_cita" ADD CONSTRAINT "tbl_cita_horario_doctor_id_fkey" FOREIGN KEY ("horario_doctor_id") REFERENCES "tbl_horario_doctor"("horario_doctor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_cita" ADD CONSTRAINT "tbl_cita_historia_clinica_id_fkey" FOREIGN KEY ("historia_clinica_id") REFERENCES "tbl_historia_clinica"("historia_clinica_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_cita" ADD CONSTRAINT "tbl_cita_estado_cita_id_fkey" FOREIGN KEY ("estado_cita_id") REFERENCES "tbl_estado_cita"("estado_cita_id") ON DELETE CASCADE ON UPDATE CASCADE;
