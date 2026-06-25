-- CreateTable
CREATE TABLE "tbl_persona" (
    "persona_id" SERIAL NOT NULL,
    "genero_id" INTEGER NOT NULL,
    "persona_cedula" VARCHAR(10) NOT NULL,
    "persona_primer_nombre" VARCHAR(50) NOT NULL,
    "persona_segundo_nombre" VARCHAR(50),
    "persona_primer_apellido" VARCHAR(50) NOT NULL,
    "persona_segundo_apellido" VARCHAR(50),
    "persona_fecha_nacimiento" DATE NOT NULL,
    "persona_direccion" VARCHAR(500) NOT NULL,
    "persona_telefono" VARCHAR(10) NOT NULL,
    "persona_correo" VARCHAR(500) NOT NULL,
    "persona_estado" CHAR(1) NOT NULL DEFAULT 'A',

    CONSTRAINT "tbl_persona_pkey" PRIMARY KEY ("persona_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_persona_genero_id_key" ON "tbl_persona"("genero_id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_persona_persona_cedula_key" ON "tbl_persona"("persona_cedula");

-- AddForeignKey
ALTER TABLE "tbl_persona" ADD CONSTRAINT "tbl_persona_genero_id_fkey" FOREIGN KEY ("genero_id") REFERENCES "tbl_genero"("genero_id") ON DELETE CASCADE ON UPDATE CASCADE;
