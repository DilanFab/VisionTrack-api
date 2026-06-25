-- CreateTable
CREATE TABLE "tbl_genero" (
    "genero_id" SERIAL NOT NULL,
    "genero_nombre" VARCHAR(20) NOT NULL,
    "genero_estado" CHAR(1) NOT NULL DEFAULT 'A',

    CONSTRAINT "tbl_genero_pkey" PRIMARY KEY ("genero_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_genero_genero_nombre_key" ON "tbl_genero"("genero_nombre");
