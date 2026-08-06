import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET no está definido en las variables de entorno");
}

export interface JwtPayload {
  usuario_id: number;
  usuario_nombre: string;
  email: string;
  roles: string[];
}

declare global {
  namespace Express {
    interface Request {
      usuario?: JwtPayload;
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.AUTH_BYPASS === "true") {
    req.usuario = {
      usuario_id: 1,
      usuario_nombre: "bypass",
      email: "bypass@test.com",
      roles: ["Administrador"],
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "Token no proporcionado" });
    return;
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
    req.usuario = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};

export const authorize = (...rolesPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (process.env.AUTH_BYPASS === "true") {
      return next();
    }

    if (!req.usuario) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const tieneAcceso = req.usuario.roles.some((rol) => rolesPermitidos.includes(rol));
    if (!tieneAcceso) {
      res.status(403).json({
        error: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(", ")}`,
      });
      return;
    }

    next();
  };
};
