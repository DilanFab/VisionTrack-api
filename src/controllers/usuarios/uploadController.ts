import { Request, Response } from "express";

/**
 * @openapi
 * /api/uploads/imagen:
 *   post:
 *     tags: [Uploads]
 *     summary: Subir imagen de usuario
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               imagen:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: URL de la imagen subida
 *       400:
 *         description: No se recibió archivo
 */
export const subirImagenUsuario = (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "No se recibió ningún archivo de imagen" });
    return;
  }
  res.status(201).json({ url: `/uploads/usuarios/${req.file.filename}` });
};

/**
 * @openapi
 * /api/uploads/imagen-paciente:
 *   post:
 *     tags: [Uploads]
 *     summary: Subir imagen de paciente (público)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               imagen:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: URL relativa de la imagen (guardada en el frontend)
 *       400:
 *         description: No se recibió archivo
 */
export const subirImagenPaciente = (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "No se recibió ningún archivo de imagen" });
    return;
  }
  res.status(201).json({ url: `/pacientes/${req.file.filename}` });
};
