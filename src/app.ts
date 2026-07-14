import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { errorHandler } from "./middlewares/errorHandler";
import { generalLimiter } from "./middlewares/rateLimit";
import { iniciarRecordatorioCitas } from "./jobs/recordatorioCitas";

// Gestión de Usuarios
import generoRoutes from "./routes/usuarios/generoRoutes";
import personaRoutes from "./routes/usuarios/personaRoutes";
import usuarioRoutes from "./routes/usuarios/usuarioRoutes";
import usuarioCompletoRoutes from "./routes/usuarios/usuarioCompletoRoutes";
import uploadRoutes from "./routes/usuarios/uploadRoutes";
import authRoutes from "./routes/authRoutes";
// Gestión de Roles y Permisos
import menuRoutes from "./routes/rolesPermisos/menuRoutes";
import rolRoutes from "./routes/rolesPermisos/rolRoutes";
import permisoRoutes from "./routes/rolesPermisos/permisoRoutes";
import perfilRoutes from "./routes/rolesPermisos/perfilRoutes";
// Gestión de Médicos
import especialidadMedicaRoutes from "./routes/medicos/especialidadMedicaRoutes";
import doctorRoutes from "./routes/medicos/doctorRoutes";
import doctorCompletoRoutes from "./routes/medicos/doctorCompletoRoutes";
import horarioDoctorRoutes from "./routes/medicos/horarioDoctorRoutes";
// Gestión de Citas
import historiaClinicaRoutes from "./routes/citas/historiaClinicaRoutes";
import pacienteCompletoRoutes from "./routes/citas/pacienteCompletoRoutes";
import estadoCitaRoutes from "./routes/citas/estadoCitaRoutes";
import citaRoutes from "./routes/citas/citaRoutes";
// App Móvil
import pacienteMovilRoutes from "./routes/movil/pacienteRoutes";
// Notificaciones
import notificacionesRoutes from "./routes/notificacionesRoutes";
// Documentación (Swagger UI)
import docsRoutes from "./docs/routes";

dotenv.config();

const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(generalLimiter);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "VisionTrack API funcionando correctamente 🚀" });
});

// Rutas

// Gestión de Usuarios
app.use("/api/generos", generoRoutes);
app.use("/api/personas", personaRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/usuarios-completos", usuarioCompletoRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/auth", authRoutes);
// Gestión de Roles y Permisos
app.use("/api/menus", menuRoutes);
app.use("/api/roles", rolRoutes);
app.use("/api/permisos", permisoRoutes);
app.use("/api/perfiles", perfilRoutes);
// Gestión de Médicos
app.use("/api/especialidades-medicas", especialidadMedicaRoutes);
app.use("/api/doctores", doctorRoutes);
app.use("/api/doctores-completos", doctorCompletoRoutes);
app.use("/api/horarios-doctor", horarioDoctorRoutes);
// Gestión de Citas
app.use("/api/historias-clinicas", historiaClinicaRoutes);
app.use("/api/pacientes-completos", pacienteCompletoRoutes);
app.use("/api/estados-cita", estadoCitaRoutes);
app.use("/api/citas", citaRoutes);
// App Móvil
app.use("/api/movil", pacienteMovilRoutes);
// Notificaciones
app.use("/api/notificaciones", notificacionesRoutes);
// Documentación (Swagger UI en /api/docs)
app.use("/api/docs", docsRoutes);

// Manejador global de errores (debe ir último)
app.use(errorHandler);

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  iniciarRecordatorioCitas();
});

export default app;