import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// ============================================
// EDITA ESTOS CAMPOS CON LOS DATOS DEL ADMIN
// ============================================
const ADMIN = {
  cedula: "2134567890",                    // ej: "001-1234567"
  primer_nombre: "Dilan",             // ej: "Juan"
  segundo_nombre: "Fabricio",            // ej: "" o null
  primer_apellido: "Perez",           // ej: "Pérez"
  segundo_apellido: "",          // ej: "" o null
  fecha_nacimiento: "1997-02-09",          // ej: "1990-01-15" (YYYY-MM-DD)
  direccion: "Quito",                 // ej: "Av. Principal 123"
  telefono: "0999999999",                  // ej: "+57 300 1234567"
  correo: "dilanpr82@gmail.com",                    // ej: "admin@visiontrack.health"
  usuario_nombre: "dilan",            // ej: "admin"
  usuario_contrasena: "dilan123",        // ej: "Admin123456" (mínimo 8 caracteres)
  genero_nombre: "Masculino",    // "Masculino" | "Femenino" | "Otro"
};
// ============================================

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const camposRequeridos: [string, string][] = [
    ["cedula", ADMIN.cedula],
    ["primer_nombre", ADMIN.primer_nombre],
    ["primer_apellido", ADMIN.primer_apellido],
    ["fecha_nacimiento", ADMIN.fecha_nacimiento],
    ["direccion", ADMIN.direccion],
    ["telefono", ADMIN.telefono],
    ["correo", ADMIN.correo],
    ["usuario_nombre", ADMIN.usuario_nombre],
    ["usuario_contrasena", ADMIN.usuario_contrasena],
  ];

  const faltantes = camposRequeridos.filter(([, v]) => !v).map(([k]) => k);
  if (faltantes.length > 0) {
    console.error("Error: Faltan campos obligatorios en la constante ADMIN:");
    faltantes.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }

  if (ADMIN.usuario_contrasena.length < 8) {
    console.error("Error: La contraseña debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  const genero = await prisma.tbl_genero.findFirst({
    where: { genero_nombre: ADMIN.genero_nombre },
  });
  if (!genero) {
    console.error(`Error: Género "${ADMIN.genero_nombre}" no encontrado. Ejecuta el seed primero.`);
    process.exit(1);
  }

  const rolAdmin = await prisma.tbl_rol.findFirst({
    where: { rol_nombre: "Administrador" },
  });
  if (!rolAdmin) {
    console.error('Error: Rol "Administrador" no encontrado. Ejecuta el seed primero.');
    process.exit(1);
  }

  const usuarioExistente = await prisma.tbl_usuario.findFirst({
    where: { usuario_nombre: ADMIN.usuario_nombre },
  });
  if (usuarioExistente) {
    console.error(`Error: Ya existe un usuario con el nombre "${ADMIN.usuario_nombre}".`);
    process.exit(1);
  }

  const cedulaExistente = await prisma.tbl_persona.findFirst({
    where: { persona_cedula: ADMIN.cedula },
  });
  if (cedulaExistente) {
    console.error(`Error: Ya existe una persona con la cédula "${ADMIN.cedula}".`);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(ADMIN.usuario_contrasena, 10);

  const usuarioId = await prisma.$transaction(async (tx) => {
    const persona = await tx.tbl_persona.create({
      data: {
        genero_id: genero.genero_id,
        persona_cedula: ADMIN.cedula,
        persona_primer_nombre: ADMIN.primer_nombre,
        persona_segundo_nombre: ADMIN.segundo_nombre || null,
        persona_primer_apellido: ADMIN.primer_apellido,
        persona_segundo_apellido: ADMIN.segundo_apellido || null,
        persona_fecha_nacimiento: new Date(ADMIN.fecha_nacimiento),
        persona_direccion: ADMIN.direccion,
        persona_telefono: ADMIN.telefono,
        persona_correo: ADMIN.correo,
        persona_estado: "A",
      },
    });

    const usuario = await tx.tbl_usuario.create({
      data: {
        persona_id: persona.persona_id,
        usuario_nombre: ADMIN.usuario_nombre,
        usuario_contrasena: hashedPassword,
        usuario_imagen: "default.png",
        usuario_estado: "A",
        usuario_intentos: 0,
      },
    });

    await tx.tbl_perfil.create({
      data: {
        usuario_id: usuario.usuario_id,
        rol_id: rolAdmin.rol_id,
        perfil_estado: "A",
      },
    });

    return usuario.usuario_id;
  });

  console.log("\n✓ Admin creado exitosamente.");
  console.log(`  usuario_id: ${usuarioId}`);
  console.log(`  usuario: ${ADMIN.usuario_nombre}`);
  console.log(`  email: ${ADMIN.correo}`);
  console.log(`  contraseña: ${ADMIN.usuario_contrasena}`);
  console.log(`  rol: Administrador (id: ${rolAdmin.rol_id})`);
  console.log("\n  Ahora puedes hacer login desde el frontend con estas credenciales.");
}

main()
  .catch((e) => {
    console.error("Error durante la creación del Admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
