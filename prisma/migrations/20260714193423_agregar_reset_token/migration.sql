-- AlterTable
ALTER TABLE "tbl_menu" ALTER COLUMN "menu_padre" SET DEFAULT NULL;

-- CreateTable
CREATE TABLE "tbl_reset_token" (
    "reset_token_id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "reset_token_hash" VARCHAR(255) NOT NULL,
    "reset_token_expires_at" TIMESTAMP(3) NOT NULL,
    "reset_token_usado" BOOLEAN NOT NULL DEFAULT false,
    "reset_token_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reset_token_used_at" TIMESTAMP(3),

    CONSTRAINT "tbl_reset_token_pkey" PRIMARY KEY ("reset_token_id")
);

-- AddForeignKey
ALTER TABLE "tbl_reset_token" ADD CONSTRAINT "tbl_reset_token_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "tbl_usuario"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;
