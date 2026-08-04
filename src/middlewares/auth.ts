import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt";

export interface TokenPayload {
  usuario_id: number;
  usuario_nombre: string;
  email: string;
  roles: string[];
}

declare global {
  namespace Express {
    interface Request {
      usuario?: TokenPayload;
    }
  }
}

export const verificarToken = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Token no proporcionado" });
    return;
  }

  try {
    req.usuario = jwt.verify(token, JWT_SECRET) as TokenPayload;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};
