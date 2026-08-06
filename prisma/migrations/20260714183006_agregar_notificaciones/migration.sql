-- DropIndex
DROP INDEX "tbl_doctor_especialidad_medica_id_key";

-- AlterTable
ALTER TABLE "tbl_cita" ADD COLUMN     "cita_notificacion_enviada" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tbl_menu" ALTER COLUMN "menu_padre" SET DEFAULT NULL;

-- CreateTable
CREATE TABLE "tbl_push_token" (
    "push_token_id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_push_token_pkey" PRIMARY KEY ("push_token_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_push_token_token_key" ON "tbl_push_token"("token");

-- AddForeignKey
ALTER TABLE "tbl_push_token" ADD CONSTRAINT "tbl_push_token_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "tbl_usuario"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;
