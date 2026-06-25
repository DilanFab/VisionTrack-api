-- CreateTable
CREATE TABLE "tbl_menu" (
    "menu_id" SERIAL NOT NULL,
    "menu_padre" INTEGER DEFAULT NULL,
    "menu_nombre" VARCHAR(50) NOT NULL,
    "menu_icono" VARCHAR(500),
    "menu_referencia" VARCHAR(500),
    "menu_estado" CHAR(1) NOT NULL DEFAULT 'A',

    CONSTRAINT "tbl_menu_pkey" PRIMARY KEY ("menu_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_menu_menu_nombre_key" ON "tbl_menu"("menu_nombre");

-- AddForeignKey
ALTER TABLE "tbl_menu" ADD CONSTRAINT "tbl_menu_menu_padre_fkey" FOREIGN KEY ("menu_padre") REFERENCES "tbl_menu"("menu_id") ON DELETE SET NULL ON UPDATE CASCADE;
