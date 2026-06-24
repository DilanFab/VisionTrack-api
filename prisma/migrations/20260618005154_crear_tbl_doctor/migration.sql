-- AlterTable
ALTER TABLE "tbl_menu" ALTER COLUMN "menu_padre" SET DEFAULT NULL;

-- CreateTable
CREATE TABLE "tbl_doctor" (
    "doctor_id" SERIAL NOT NULL,
    "especialidad_medica_id" INTEGER NOT NULL,
    "perfil_id" INTEGER NOT NULL,
    "doctor_estado" CHAR(1) NOT NULL DEFAULT 'A',

    CONSTRAINT "tbl_doctor_pkey" PRIMARY KEY ("doctor_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_doctor_especialidad_medica_id_key" ON "tbl_doctor"("especialidad_medica_id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_doctor_perfil_id_key" ON "tbl_doctor"("perfil_id");

-- AddForeignKey
ALTER TABLE "tbl_doctor" ADD CONSTRAINT "tbl_doctor_especialidad_medica_id_fkey" FOREIGN KEY ("especialidad_medica_id") REFERENCES "tbl_especialidad_medica"("especialidad_medica_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_doctor" ADD CONSTRAINT "tbl_doctor_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "tbl_perfil"("perfil_id") ON DELETE CASCADE ON UPDATE CASCADE;
