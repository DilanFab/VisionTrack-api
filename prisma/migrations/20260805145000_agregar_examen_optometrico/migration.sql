-- CreateTable
CREATE TABLE "tbl_examen_optometrico" (
    "examen_optometrico_id" SERIAL NOT NULL,
    "historia_clinica_id" INTEGER NOT NULL,
    "cita_id" INTEGER,
    "examinador_id" INTEGER,
    "examen_fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "examen_hora" TIME,
    "examen_consultorio" VARCHAR(100),
    "examen_llave" VARCHAR(100),
    "examen_motivo_consulta" TEXT,
    "examen_anamnesis" TEXT,
    "antecedentes_personales_oculares" TEXT,
    "antecedentes_personales_generales" TEXT,
    "antecedentes_familiares_oculares" TEXT,
    "antecedentes_familiares_generales" TEXT,
    "lensometria" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "agudeza_visual" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "biomicroscopia" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "reflejos_pupilares" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "oftalmoscopia" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "examen_motor" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "queratometria" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "refraccion" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "diagnostico_od" TEXT,
    "diagnostico_oi" TEXT,
    "diagnostico_motor" TEXT,
    "cie10" VARCHAR(20),
    "patologico_presuntivo" TEXT,
    "tratamiento_conducta" TEXT,
    "consentimiento_informado" BOOLEAN NOT NULL DEFAULT false,
    "consentimiento_firma" TEXT,
    "examen_nombre_examinador" VARCHAR(150),
    "examen_nivel_paralelo_jornada" VARCHAR(150),
    "examen_estado" CHAR(1) NOT NULL DEFAULT 'B',
    "examen_creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "examen_actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_examen_optometrico_pkey" PRIMARY KEY ("examen_optometrico_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_examen_optometrico_cita_id_key" ON "tbl_examen_optometrico"("cita_id");

-- CreateIndex
CREATE INDEX "tbl_examen_optometrico_historia_clinica_id_idx" ON "tbl_examen_optometrico"("historia_clinica_id");

-- CreateIndex
CREATE INDEX "tbl_examen_optometrico_examinador_id_idx" ON "tbl_examen_optometrico"("examinador_id");

-- CreateIndex
CREATE INDEX "tbl_examen_optometrico_examen_estado_idx" ON "tbl_examen_optometrico"("examen_estado");

-- CreateIndex
CREATE INDEX "tbl_examen_optometrico_examen_fecha_idx" ON "tbl_examen_optometrico"("examen_fecha");

-- AddForeignKey
ALTER TABLE "tbl_examen_optometrico" ADD CONSTRAINT "tbl_examen_optometrico_historia_clinica_id_fkey" FOREIGN KEY ("historia_clinica_id") REFERENCES "tbl_historia_clinica"("historia_clinica_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_examen_optometrico" ADD CONSTRAINT "tbl_examen_optometrico_cita_id_fkey" FOREIGN KEY ("cita_id") REFERENCES "tbl_cita"("cita_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_examen_optometrico" ADD CONSTRAINT "tbl_examen_optometrico_examinador_id_fkey" FOREIGN KEY ("examinador_id") REFERENCES "tbl_usuario"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;
