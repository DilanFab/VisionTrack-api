-- CreateTable
CREATE TABLE "tbl_usuario" (
    "usuario_id" SERIAL NOT NULL,
    "persona_id" INTEGER NOT NULL,
    "usuario_imagen" VARCHAR(255) NOT NULL,
    "usuario_nombre" VARCHAR(100) NOT NULL,
    "usuario_contrasena" VARCHAR(255) NOT NULL,
    "usuario_intentos" INTEGER NOT NULL DEFAULT 0,
    "usuario_cambiar_contrasena" SMALLINT NOT NULL DEFAULT 0,
    "usuario_estado" CHAR(1) NOT NULL DEFAULT 'A',

    CONSTRAINT "tbl_usuario_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_usuario_persona_id_key" ON "tbl_usuario"("persona_id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_usuario_usuario_nombre_key" ON "tbl_usuario"("usuario_nombre");

-- AddForeignKey
ALTER TABLE "tbl_usuario" ADD CONSTRAINT "tbl_usuario_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "tbl_persona"("persona_id") ON DELETE CASCADE ON UPDATE CASCADE;
