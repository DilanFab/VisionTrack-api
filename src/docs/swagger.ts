import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "VisionTrack API",
      version: "1.0.0",
      description:
        "API REST para sistema de gestión de clínica optométrica. " +
        "Incluye autenticación JWT, gestión de usuarios, roles y permisos, " +
        "médicos, citas, historias clínicas y notificaciones.",
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:3000",
        description: "Servidor local de desarrollo",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Mensaje de error" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Auth", description: "Autenticación y recuperación de contraseña" },
      { name: "Generos", description: "Gestión de géneros" },
      { name: "Personas", description: "Gestión de personas" },
      { name: "Usuarios", description: "Gestión de usuarios" },
      { name: "UsuariosCompletos", description: "CRUD compuesto de usuarios" },
      { name: "Uploads", description: "Subida de imágenes" },
      { name: "Menus", description: "Gestión de menús" },
      { name: "Roles", description: "Gestión de roles" },
      { name: "Permisos", description: "Gestión de permisos" },
      { name: "Perfiles", description: "Gestión de perfiles" },
      { name: "EspecialidadesMedicas", description: "Gestión de especialidades médicas" },
      { name: "Doctores", description: "Gestión de doctores" },
      { name: "DoctoresCompletos", description: "CRUD compuesto de doctores" },
      { name: "HorariosDoctor", description: "Gestión de horarios de doctor" },
      { name: "HistoriasClinicas", description: "Gestión de historias clínicas" },
      { name: "PacientesCompletos", description: "CRUD compuesto de pacientes" },
      { name: "EstadosCita", description: "Gestión de estados de cita" },
      { name: "Citas", description: "Gestión de citas" },
      { name: "Movil", description: "Endpoints de la app móvil" },
      { name: "Notificaciones", description: "Gestión de tokens push" },
    ],
  },
  apis: ["./dist/controllers/**/*.js", "./src/controllers/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
