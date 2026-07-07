import { Request, Response } from "express";

// POST /api/uploads/imagen (multipart/form-data, campo "imagen")
export const subirImagenUsuario = (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "No se recibió ningún archivo de imagen" });
    return;
  }
  res.status(201).json({ url: `/uploads/usuarios/${req.file.filename}` });
};

// POST /api/uploads/imagen-paciente (multipart/form-data, campo "imagen")
// Guarda el archivo directamente en VisionTrack-front/public/pacientes, así que
// la url devuelta es relativa al propio frontend (sin prefijo /uploads de la API).
export const subirImagenPaciente = (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "No se recibió ningún archivo de imagen" });
    return;
  }
  res.status(201).json({ url: `/pacientes/${req.file.filename}` });
};
