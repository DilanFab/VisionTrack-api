import multer from "multer";
import path from "path";
import fs from "fs";

export const UPLOADS_ROOT = path.join(__dirname, "..", "..", "uploads");
const usuariosDir = path.join(UPLOADS_ROOT, "usuarios");
fs.mkdirSync(usuariosDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, usuariosDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `usuario-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

export const uploadImagenUsuario = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Solo se permiten archivos de imagen"));
      return;
    }
    cb(null, true);
  },
});

// Las fotos de pacientes se guardan directamente en la carpeta `public/` del
// proyecto de frontend (proyecto hermano en el mismo workspace) para que Vite
// las sirva como estáticos propios, sin pasar por el prefijo /uploads de la API.
const FRONTEND_PUBLIC_ROOT = path.join(__dirname, "..", "..", "..", "VisionTrack-front", "public");
const pacientesDir = path.join(FRONTEND_PUBLIC_ROOT, "pacientes");
fs.mkdirSync(pacientesDir, { recursive: true });

const pacienteStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, pacientesDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `paciente-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

export const uploadImagenPaciente = multer({
  storage: pacienteStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Solo se permiten archivos de imagen"));
      return;
    }
    cb(null, true);
  },
});
