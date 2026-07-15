import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Iniciando seed...");

  await prisma.$transaction(
    async (tx) => {
    // 1. Géneros
    const generos = ["Masculino", "Femenino", "Otro"];
    for (const nombre of generos) {
      await tx.tbl_genero.upsert({
        where: { genero_nombre: nombre },
        update: {},
        create: { genero_nombre: nombre },
      });
    }
    console.log(`  ✓ ${generos.length} géneros`);

    // 2. Roles
    const rolesData = [
      { rol_nombre: "Administrador", rol_descripcion: "Acceso total al sistema" },
      { rol_nombre: "Recepcionista", rol_descripcion: "Gestión de citas y pacientes" },
      { rol_nombre: "Médico", rol_descripcion: "Atención médica y historias clínicas" },
      { rol_nombre: "Paciente", rol_descripcion: "Portal del paciente" },
    ];

    const roles: Record<string, number> = {};
    for (const r of rolesData) {
      const rol = await tx.tbl_rol.upsert({
        where: { rol_nombre: r.rol_nombre },
        update: { rol_descripcion: r.rol_descripcion },
        create: r,
      });
      roles[r.rol_nombre] = rol.rol_id;
    }
    console.log(`  ✓ ${rolesData.length} roles`);

    // 3. Estados de Cita
    const estadosCita = [
      { estado_cita_nombre: "Programada", estado_cita_descripcion: "Cita programada por el paciente o recepcionista" },
      { estado_cita_nombre: "Confirmada", estado_cita_descripcion: "Cita confirmada por el centro médico" },
      { estado_cita_nombre: "Cancelada", estado_cita_descripcion: "Cita cancelada" },
      { estado_cita_nombre: "Completada", estado_cita_descripcion: "Cita atendida y completada" },
    ];
    for (const e of estadosCita) {
      await tx.tbl_estado_cita.upsert({
        where: { estado_cita_nombre: e.estado_cita_nombre },
        update: { estado_cita_descripcion: e.estado_cita_descripcion },
        create: e,
      });
    }
    console.log(`  ✓ ${estadosCita.length} estados de cita`);

    // 4. Menús raíz
    const raicesData = [
      { menu_nombre: "Panel Principal", menu_icono: null, menu_referencia: null },
      { menu_nombre: "Gestión de Citas", menu_icono: null, menu_referencia: null },
      { menu_nombre: "Gestión de Personal", menu_icono: null, menu_referencia: null },
      { menu_nombre: "Roles y Permisos", menu_icono: null, menu_referencia: null },
      { menu_nombre: "Gestión de Usuarios", menu_icono: null, menu_referencia: null },
      { menu_nombre: "Gestión Médica", menu_icono: null, menu_referencia: null },
    ];

    const raices: Record<string, number> = {};
    for (const r of raicesData) {
      const menu = await tx.tbl_menu.upsert({
        where: { menu_nombre: r.menu_nombre },
        update: {},
        create: { ...r, menu_padre: null },
      });
      raices[r.menu_nombre] = menu.menu_id;
    }
    console.log(`  ✓ ${raicesData.length} menús raíz`);

    // 5. Menús hoja
    const hojasData = [
      { menu_nombre: "Dashboard",       padre: "Panel Principal",     icono: "gauge-high",     ref: "/dashboard" },
      { menu_nombre: "Citas",           padre: "Gestión de Citas",    icono: "calendar-check", ref: "/citas" },
      { menu_nombre: "Pacientes",       padre: "Gestión de Citas",    icono: "wheelchair",     ref: "/usuarios/pacientes" },
      { menu_nombre: "Estados de Cita", padre: "Gestión de Citas",    icono: "circle-check",   ref: "/citas/estados" },
      { menu_nombre: "Historial",       padre: "Gestión de Citas",    icono: "clipboard-list", ref: "/historial" },
      { menu_nombre: "Personal",        padre: "Gestión de Personal", icono: "id-badge",       ref: "/personal" },
      { menu_nombre: "Menús",           padre: "Roles y Permisos",    icono: "bars",           ref: "/roles-permisos/menus" },
      { menu_nombre: "Roles",           padre: "Roles y Permisos",    icono: "user-shield",    ref: "/roles-permisos/roles" },
      { menu_nombre: "Géneros",         padre: "Gestión de Usuarios", icono: "venus-mars",     ref: "/usuarios/generos" },
      { menu_nombre: "Administradores", padre: "Gestión de Usuarios", icono: "user-tie",       ref: "/usuarios/administradores" },
      { menu_nombre: "Recepcionistas",  padre: "Gestión de Usuarios", icono: "user-gear",      ref: "/usuarios/recepcionistas" },
      { menu_nombre: "Especialidades",  padre: "Gestión Médica",      icono: "stethoscope",    ref: "/medicos/especialidades" },
      { menu_nombre: "Doctores",        padre: "Gestión Médica",      icono: "user-doctor",    ref: "/medicos/doctores" },
    ];

    for (const h of hojasData) {
      await tx.tbl_menu.upsert({
        where: { menu_nombre: h.menu_nombre },
        update: { menu_padre: raices[h.padre], menu_icono: h.icono, menu_referencia: h.ref },
        create: {
          menu_nombre: h.menu_nombre,
          menu_padre: raices[h.padre],
          menu_icono: h.icono,
          menu_referencia: h.ref,
        },
      });
    }
    console.log(`  ✓ ${hojasData.length} menús hoja`);

    // 6. Permisos: Administrador accede a todos los menús
    const adminRolId = roles["Administrador"];
    const allMenus = await tx.tbl_menu.findMany();
    let permisosCreados = 0;
    for (const menu of allMenus) {
      const created = await tx.tbl_permiso.upsert({
        where: { rol_id_menu_id: { rol_id: adminRolId, menu_id: menu.menu_id } },
        update: { permiso_estado: "A" },
        create: { rol_id: adminRolId, menu_id: menu.menu_id, permiso_estado: "A" },
      });
      if (created) permisosCreados++;
    }
    console.log(`  ✓ ${permisosCreados} permisos (Administrador → todos los menús)`);
    },
    { timeout: 60000 }
  );

  console.log("\nSeed completado exitosamente.");
}

main()
  .catch((e) => {
    console.error("Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
