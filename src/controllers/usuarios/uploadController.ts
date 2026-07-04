import { Request, Response } from "express";

// POST /api/uploads/imagen (multipart/form-data, campo "imagen")
export const subirImagenUsuario = (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "No se recibió ningún archivo de imagen" });
    return;
  }
  res.status(201).json({ url: `/uploads/usuarios/${req.file.filename}` });
};
