require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seed() {
  const tarifas = [
    { iva_porcentaje: 0,  iva_descripcion: 'IVA 0% (Exento / Feriados)', iva_activo: true },
    { iva_porcentaje: 5,  iva_descripcion: 'IVA 5% (Reducido)',           iva_activo: true },
    { iva_porcentaje: 8,  iva_descripcion: 'IVA 8% (Intermedio)',         iva_activo: true },
    { iva_porcentaje: 15, iva_descripcion: 'IVA 15% (General)',           iva_activo: true },
  ];

  for (const t of tarifas) {
    await prisma.tbl_configuracion_iva.upsert({
      where: { iva_porcentaje: t.iva_porcentaje },
      update: {},
      create: t,
    });
  }

  console.log('Seed IVA completado: 4 tarifas insertadas (0%, 5%, 8%, 15%).');
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
