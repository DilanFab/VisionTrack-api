import { Request, Response } from "express";
import * as authService from "../services/authService";

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
