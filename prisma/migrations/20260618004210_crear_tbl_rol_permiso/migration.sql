-- AlterTable
ALTER TABLE "tbl_menu" ALTER COLUMN "menu_padre" SET DEFAULT NULL;

-- CreateTable
CREATE TABLE "tbl_rol" (
    "rol_id" SERIAL NOT NULL,
    "rol_nombre" VARCHAR(100) NOT NULL,
    "rol_descripcion" VARCHAR(500) NOT NULL,
    "rol_estado" CHAR(1) NOT NULL DEFAULT 'A',

    CONSTRAINT "tbl_rol_pkey" PRIMARY KEY ("rol_id")
);

-- CreateTable
CREATE TABLE "tbl_permiso" (
    "permiso_id" SERIAL NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "menu_id" INTEGER NOT NULL,
    "permiso_estado" CHAR(1) NOT NULL DEFAULT 'A',

    CONSTRAINT "tbl_permiso_pkey" PRIMARY KEY ("permiso_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_rol_rol_nombre_key" ON "tbl_rol"("rol_nombre");

-- AddForeignKey
ALTER TABLE "tbl_permiso" ADD CONSTRAINT "tbl_permiso_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "tbl_rol"("rol_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_permiso" ADD CONSTRAINT "tbl_permiso_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "tbl_menu"("menu_id") ON DELETE CASCADE ON UPDATE CASCADE;
