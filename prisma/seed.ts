import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Protección: nunca ejecutar seeds en producción salvo override explícito.
  const esProduccion = process.env.NODE_ENV === "production";
  const override = process.env.RUN_SEEDS === "true";
  if (esProduccion && !override) {
    console.log("⛔ Seeds omitidos: entorno de producción. Define RUN_SEEDS=true solo en staging/desarrollo para forzar.");
    return;
  }

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

      // 6. Menús del portal del paciente
      const portalRoot = await tx.tbl_menu.upsert({
        where: { menu_nombre: "Portal del Paciente" },
        update: { menu_icono: null, menu_referencia: null, menu_padre: null },
        create: {
          menu_nombre: "Portal del Paciente",
          menu_icono: null,
          menu_referencia: null,
          menu_padre: null,
        },
      });

      const portalHojasData = [
        { menu_nombre: "Inicio", icono: "house", ref: "/dashboard" },
        { menu_nombre: "Mis Citas", icono: "calendar-check", ref: "/citas" },
        { menu_nombre: "Agendar Cita", icono: "calendar-plus", ref: "/agendar" },
        { menu_nombre: "Mi Historial", icono: "clipboard-list", ref: "/historial" },
        { menu_nombre: "Mi Perfil", icono: "user", ref: "/perfil" },
      ];

      for (const h of portalHojasData) {
        await tx.tbl_menu.upsert({
          where: { menu_nombre: h.menu_nombre },
          update: { menu_padre: portalRoot.menu_id, menu_icono: h.icono, menu_referencia: h.ref },
          create: {
            menu_nombre: h.menu_nombre,
            menu_padre: portalRoot.menu_id,
            menu_icono: h.icono,
            menu_referencia: h.ref,
          },
        });
      }
      console.log(`  ✓ ${portalHojasData.length + 1} menús del portal del paciente`);

      // 7. Permisos: Administrador accede a todos los menús
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

      const pacienteRolId = roles["Paciente"];
      const portalMenus = await tx.tbl_menu.findMany({
        where: {
          OR: [
            { menu_id: portalRoot.menu_id },
            { menu_padre: portalRoot.menu_id },
          ],
        },
      });
      for (const menu of portalMenus) {
        await tx.tbl_permiso.upsert({
          where: { rol_id_menu_id: { rol_id: pacienteRolId, menu_id: menu.menu_id } },
          update: { permiso_estado: "A" },
          create: { rol_id: pacienteRolId, menu_id: menu.menu_id, permiso_estado: "A" },
        });
      }
      console.log(`  ✓ ${portalMenus.length} permisos (Paciente → portal)`);

      // 8. Configuración Fiscal (IVA)
      const tarifasIva = [
        { iva_porcentaje: 0, iva_descripcion: "IVA 0% (Exento / Feriados)", iva_activo: true },
        { iva_porcentaje: 5, iva_descripcion: "IVA 5% (Reducido)", iva_activo: true },
        { iva_porcentaje: 8, iva_descripcion: "IVA 8% (Intermedio)", iva_activo: true },
        { iva_porcentaje: 15, iva_descripcion: "IVA 15% (General)", iva_activo: true },
      ];
      for (const t of tarifasIva) {
        await tx.tbl_configuracion_iva.upsert({
          where: { iva_porcentaje: t.iva_porcentaje },
          update: {},
          create: t,
        });
      }
      console.log(`  ✓ ${tarifasIva.length} tarifas de IVA (0%, 5%, 8%, 15%)`);

      // 9. Menú "Configuraciones" (IVA) — administrado por Admin
      const configRoot = await tx.tbl_menu.upsert({
        where: { menu_nombre: "Configuraciones" },
        update: { menu_icono: "gear", menu_referencia: null, menu_padre: null },
        create: { menu_nombre: "Configuraciones", menu_padre: null, menu_icono: "gear", menu_referencia: null },
      });
      const ivaMenu = await tx.tbl_menu.upsert({
        where: { menu_nombre: "IVA" },
        update: { menu_padre: configRoot.menu_id, menu_referencia: "/configuracion-iva", menu_icono: "percent" },
        create: { menu_nombre: "IVA", menu_padre: configRoot.menu_id, menu_referencia: "/configuracion-iva", menu_icono: "percent" },
      });
      const recepcionistaRolId = roles["Recepcionista"];
      for (const m of [configRoot, ivaMenu]) {
        await tx.tbl_permiso.upsert({
          where: { rol_id_menu_id: { rol_id: adminRolId, menu_id: m.menu_id } },
          update: { permiso_estado: "A" },
          create: { rol_id: adminRolId, menu_id: m.menu_id, permiso_estado: "A" },
        });
      }
      console.log(`  ✓ menú "Configuraciones" (IVA) con permiso de Administrador`);

      // 10. Menú "Inventario y Ventas" — Admin y Recepcionista
      const invRoot = await tx.tbl_menu.upsert({
        where: { menu_nombre: "Inventario y Ventas" },
        update: { menu_icono: null, menu_referencia: null, menu_padre: null },
        create: { menu_nombre: "Inventario y Ventas", menu_padre: null, menu_icono: null, menu_referencia: null },
      });
      const invHojasData = [
        { menu_nombre: "Categorías", ref: "/inventario/categorias", icono: "tags" },
        { menu_nombre: "Productos", ref: "/inventario/productos", icono: "box" },
        { menu_nombre: "Movimientos", ref: "/inventario/movimientos", icono: "right-left" },
        { menu_nombre: "Facturación", ref: "/facturacion", icono: "receipt" },
      ];
      for (const h of invHojasData) {
        const hoja = await tx.tbl_menu.upsert({
          where: { menu_nombre: h.menu_nombre },
          update: { menu_padre: invRoot.menu_id, menu_referencia: h.ref, menu_icono: h.icono },
          create: { menu_nombre: h.menu_nombre, menu_padre: invRoot.menu_id, menu_referencia: h.ref, menu_icono: h.icono },
        });
        await tx.tbl_permiso.upsert({
          where: { rol_id_menu_id: { rol_id: adminRolId, menu_id: hoja.menu_id } },
          update: { permiso_estado: "A" },
          create: { rol_id: adminRolId, menu_id: hoja.menu_id, permiso_estado: "A" },
        });
        if (recepcionistaRolId) {
          await tx.tbl_permiso.upsert({
            where: { rol_id_menu_id: { rol_id: recepcionistaRolId, menu_id: hoja.menu_id } },
            update: { permiso_estado: "A" },
            create: { rol_id: recepcionistaRolId, menu_id: hoja.menu_id, permiso_estado: "A" },
          });
        }
      }
      await tx.tbl_permiso.upsert({
        where: { rol_id_menu_id: { rol_id: adminRolId, menu_id: invRoot.menu_id } },
        update: { permiso_estado: "A" },
        create: { rol_id: adminRolId, menu_id: invRoot.menu_id, permiso_estado: "A" },
      });
      if (recepcionistaRolId) {
        await tx.tbl_permiso.upsert({
          where: { rol_id_menu_id: { rol_id: recepcionistaRolId, menu_id: invRoot.menu_id } },
          update: { permiso_estado: "A" },
          create: { rol_id: recepcionistaRolId, menu_id: invRoot.menu_id, permiso_estado: "A" },
        });
      }
      console.log(`  ✓ menú "Inventario y Ventas" (${invHojasData.length} hojas) con permiso de Admin y Recepcionista`);
    },
    { maxWait: 20000, timeout: 60000 }
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
