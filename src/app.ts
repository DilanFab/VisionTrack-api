import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Gestión de Usuarios
import generoRoutes from "./routes/usuarios/generoRoutes";
import personaRoutes from "./routes/usuarios/personaRoutes";
import usuarioRoutes from "./routes/usuarios/usuarioRoutes";
// Gestión de Roles y Permisos
import menuRoutes from "./routes/rolesPermisos/menuRoutes";
import rolRoutes from "./routes/rolesPermisos/rolRoutes";
import permisoRoutes from "./routes/rolesPermisos/permisoRoutes";
import perfilRoutes from "./routes/rolesPermisos/perfilRoutes";
// Gestión de Médicos
import especialidadMedicaRoutes from "./routes/medicos/especialidadMedicaRoutes";
import doctorRoutes from "./routes/medicos/doctorRoutes";
import horarioDoctorRoutes from "./routes/medicos/horarioDoctorRoutes";
// Gestión de Citas
import historiaClinicaRoutes from "./routes/citas/historiaClinicaRoutes";
import estadoCitaRoutes from "./routes/citas/estadoCitaRoutes";
import citaRoutes from "./routes/citas/citaRoutes";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "VisionTrack API funcionando correctamente 🚀" });
});

// Rutas

// Gestión de Usuarios
app.use("/api/generos", generoRoutes);
app.use("/api/personas", personaRoutes);
app.use("/api/usuarios", usuarioRoutes);
// Gestión de Roles y Permisos
app.use("/api/menus", menuRoutes);
app.use("/api/roles", rolRoutes);
app.use("/api/permisos", permisoRoutes);
app.use("/api/perfiles", perfilRoutes);
// Gestión de Médicos
app.use("/api/especialidades-medicas", especialidadMedicaRoutes);
app.use("/api/doctores", doctorRoutes);
app.use("/api/horarios-doctor", horarioDoctorRoutes);
// Gestión de Citas
app.use("/api/historias-clinicas", historiaClinicaRoutes);
app.use("/api/estados-cita", estadoCitaRoutes);
app.use("/api/citas", citaRoutes);

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;