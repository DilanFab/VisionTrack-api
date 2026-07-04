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
