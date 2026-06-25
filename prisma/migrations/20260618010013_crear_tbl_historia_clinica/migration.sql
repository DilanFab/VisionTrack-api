-- AlterTable
ALTER TABLE "tbl_menu" ALTER COLUMN "menu_padre" SET DEFAULT NULL;

-- CreateTable
CREATE TABLE "tbl_historia_clinica" (
    "historia_clinica_id" SERIAL NOT NULL,
    "paciente_id" INTEGER NOT NULL,
    "historia_clinica_numero" VARCHAR(20) NOT NULL,
    "historia_clinica_fecha_apertura" DATE NOT NULL,
    "historia_clinica_estado" CHAR(1) NOT NULL DEFAULT 'A',

    CONSTRAINT "tbl_historia_clinica_pkey" PRIMARY KEY ("historia_clinica_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_historia_clinica_historia_clinica_numero_key" ON "tbl_historia_clinica"("historia_clinica_numero");

-- AddForeignKey
ALTER TABLE "tbl_historia_clinica" ADD CONSTRAINT "tbl_historia_clinica_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "tbl_perfil"("perfil_id") ON DELETE CASCADE ON UPDATE CASCADE;
