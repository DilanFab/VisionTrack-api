import { Request, Response, NextFunction } from "express";
import fs from "fs";
import { isValidImage } from "../utils/fileValidation";

export const validateUpload = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.file) {
    next();
    return;
  }

  if (!isValidImage(req.file.path)) {
    // Borrar archivo inválido
    try { fs.unlinkSync(req.file.path); } catch {}
    res.status(400).json({ error: "El archivo no es una imagen válida" });
    return;
  }

  next();
};
