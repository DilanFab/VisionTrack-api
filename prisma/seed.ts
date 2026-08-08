import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed...");

  // ─── Géneros ────────────────────────────────────────────────────────────────
  const generos = [
    { genero_nombre: "Masculino" },
    { genero_nombre: "Femenino" },
    { genero_nombre: "Otro" },
  ];

  for (const g of generos) {
    await prisma.tbl_genero.upsert({
      where: { genero_nombre: g.genero_nombre },
      update: {},
      create: g,
    });
  }
  console.log("✅ Géneros insertados");

  // ─── Roles ──────────────────────────────────────────────────────────────────
  // IMPORTANTE: El orden de inserción define los IDs auto-incrementales.
  // El authController.ts asume: 3 = Médico, 4 = Paciente.
  // Si la tabla está vacía, este seed los crea en ese orden.
  const roles = [
    { rol_nombre: "Administrador", rol_descripcion: "Acceso total al sistema" },
    { rol_nombre: "Recepcionista", rol_descripcion: "Gestión de citas y pacientes" },
    { rol_nombre: "Médico",        rol_descripcion: "Atención médica y exámenes" },
    { rol_nombre: "Paciente",      rol_descripcion: "Paciente registrado en el sistema" },
  ];

  for (const r of roles) {
    await prisma.tbl_rol.upsert({
      where: { rol_nombre: r.rol_nombre },
      update: {},
      create: r,
    });
  }
  console.log("✅ Roles insertados");

  console.log("🎉 Seed completado exitosamente");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
