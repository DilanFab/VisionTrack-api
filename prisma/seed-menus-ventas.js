require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seed() {
  // Add "Inventario y Ventas" root
  const root = await prisma.tbl_menu.upsert({
    where: { menu_nombre: "Inventario y Ventas" },
    update: {},
    create: { menu_nombre: "Inventario y Ventas", menu_padre: null, menu_icono: null, menu_referencia: null }
  });

  const menus = [
    { nombre: "Categorías", ref: "/inventario/categorias", icono: "tags" },
    { nombre: "Productos", ref: "/inventario/productos", icono: "box" },
    { nombre: "Movimientos", ref: "/inventario/movimientos", icono: "right-left" },
    { nombre: "Facturación", ref: "/facturacion", icono: "receipt" }
  ];

  for(const m of menus) {
    const hoja = await prisma.tbl_menu.upsert({
      where: { menu_nombre: m.nombre },
      update: { menu_padre: root.menu_id, menu_referencia: m.ref, menu_icono: m.icono },
      create: { menu_nombre: m.nombre, menu_padre: root.menu_id, menu_referencia: m.ref, menu_icono: m.icono }
    });
    
    // Give permission to Admin
    const adminRole = await prisma.tbl_rol.findUnique({ where: { rol_nombre: 'Administrador' } });
    if (adminRole) {
      await prisma.tbl_permiso.upsert({
        where: { rol_id_menu_id: { rol_id: adminRole.rol_id, menu_id: hoja.menu_id } },
        update: { permiso_estado: 'A' },
        create: { rol_id: adminRole.rol_id, menu_id: hoja.menu_id }
      });
      // Admin gets root
      await prisma.tbl_permiso.upsert({
        where: { rol_id_menu_id: { rol_id: adminRole.rol_id, menu_id: root.menu_id } },
        update: { permiso_estado: 'A' },
        create: { rol_id: adminRole.rol_id, menu_id: root.menu_id }
      });
    }

    // Give permission to Recepcionista
    const repRole = await prisma.tbl_rol.findUnique({ where: { rol_nombre: 'Recepcionista' } });
    if (repRole) {
      await prisma.tbl_permiso.upsert({
        where: { rol_id_menu_id: { rol_id: repRole.rol_id, menu_id: hoja.menu_id } },
        update: { permiso_estado: 'A' },
        create: { rol_id: repRole.rol_id, menu_id: hoja.menu_id }
      });
      // Rep gets root
      await prisma.tbl_permiso.upsert({
        where: { rol_id_menu_id: { rol_id: repRole.rol_id, menu_id: root.menu_id } },
        update: { permiso_estado: 'A' },
        create: { rol_id: repRole.rol_id, menu_id: root.menu_id }
      });
    }
  }

  console.log('Seed Menús Ventas completado');
  await prisma.$disconnect();
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
