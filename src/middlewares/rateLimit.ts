import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Demasiados intentos. Intenta de nuevo en 1 minuto." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: "Límite de solicitudes alcanzado. Intenta más tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});
