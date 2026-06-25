-- AlterTable
ALTER TABLE "tbl_menu" ALTER COLUMN "menu_padre" SET DEFAULT NULL;

-- CreateTable
CREATE TABLE "tbl_perfil" (
    "perfil_id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "perfil_estado" CHAR(1) NOT NULL DEFAULT 'A',

    CONSTRAINT "tbl_perfil_pkey" PRIMARY KEY ("perfil_id")
);

-- AddForeignKey
ALTER TABLE "tbl_perfil" ADD CONSTRAINT "tbl_perfil_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "tbl_usuario"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_perfil" ADD CONSTRAINT "tbl_perfil_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "tbl_rol"("rol_id") ON DELETE CASCADE ON UPDATE CASCADE;
