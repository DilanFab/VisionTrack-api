import { Request, Response } from "express";
import * as authService from "../services/authService";

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "juan@test.com" }
 *               password: { type: string, example: "password123" }
 *     responses:
 *       200:
 *         description: Tokens y datos del usuario
 *       400:
 *         description: Validación fallida
 *       401:
 *         description: Credenciales incorrectas
 *       423:
 *         description: Cuenta bloqueada
 */
export const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor al iniciar sesión" });
  }
};

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar paciente o doctor
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo: { type: string, enum: [paciente, doctor], example: "paciente" }
 *               cedula: { type: string, example: "1234567890" }
 *               primer_nombre: { type: string, example: "Juan" }
 *               primer_apellido: { type: string, example: "Perez" }
 *               fecha_nacimiento: { type: string, example: "1990-01-01" }
 *               direccion: { type: string, example: "Calle 123" }
 *               telefono: { type: string, example: "0991234567" }
 *               correo: { type: string, example: "juan@test.com" }
 *               genero_id: { type: integer, example: 1 }
 *               usuario_nombre: { type: string, example: "juanp" }
 *               usuario_contrasena: { type: string, example: "password123" }
 *     responses:
 *       201:
 *         description: Tokens y datos del usuario
 *       400:
 *         description: Validación fallida o dato duplicado
 */
export const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error en el servidor al registrar el usuario" });
  }
};

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Renovar tokens con refresh token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string, example: "eyJhbGciOi..." }
 *     responses:
 *       200:
 *         description: Nuevos access y refresh tokens
 *       401:
 *         description: Refresh token inválido o expirado
 */
export const refresh = async (req: Request, res: Response) => {
  try {
    const result = await authService.refresh(req.body);
    res.json(result);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    console.error("Error en refresh:", error);
    res.status(500).json({ error: "Error al refrescar el token" });
  }
};

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Solicitar recuperación de contraseña
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, example: "juan@test.com" }
 *     responses:
 *       200:
 *         description: Siempre responde 200 (no revela si el correo existe)
 *       400:
 *         description: Email inválido
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const result = await authService.forgotPassword(req.body);
    res.json(result);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    console.error("Error en forgot-password:", error);
    res.status(500).json({ error: "Error al solicitar recuperación de contraseña" });
  }
};

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Restablecer contraseña con token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token: { type: string, example: "a1b2c3..." }
 *               password: { type: string, example: "nuevaPassword123" }
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       400:
 *         description: Token inválido, expirado o contraseña inválida
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const result = await authService.resetPassword(req.body);
    res.json(result);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    console.error("Error en reset-password:", error);
    res.status(500).json({ error: "Error al restablecer la contraseña" });
  }
};
