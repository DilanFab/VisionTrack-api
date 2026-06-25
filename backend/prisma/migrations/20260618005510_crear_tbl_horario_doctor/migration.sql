-- CreateEnum
CREATE TYPE "enum_dias" AS ENUM ('Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes');

-- AlterTable
ALTER TABLE "tbl_menu" ALTER COLUMN "menu_padre" SET DEFAULT NULL;

-- CreateTable
CREATE TABLE "tbl_horario_doctor" (
    "horario_doctor_id" SERIAL NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "horario_doctor_dia" "enum_dias" NOT NULL,
    "horario_doctor_inicio" TIME NOT NULL,
    "horario_doctor_fin" TIME NOT NULL,
    "horario_doctor_estado" CHAR(1) NOT NULL DEFAULT 'A',

    CONSTRAINT "tbl_horario_doctor_pkey" PRIMARY KEY ("horario_doctor_id")
);

-- AddForeignKey
ALTER TABLE "tbl_horario_doctor" ADD CONSTRAINT "tbl_horario_doctor_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "tbl_doctor"("doctor_id") ON DELETE CASCADE ON UPDATE CASCADE;
