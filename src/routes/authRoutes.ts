import { Router } from "express";
import { login, register, refresh, forgotPassword, resetPassword } from "../controllers/authController";
import { authLimiter } from "../middlewares/rateLimit";

const router = Router();

// POST /api/auth/login
router.post("/login", authLimiter, login);

// POST /api/auth/register
router.post("/register", authLimiter, register);

// POST /api/auth/refresh
router.post("/refresh", authLimiter, refresh);

// POST /api/auth/forgot-password (público)
router.post("/forgot-password", forgotPassword);

// POST /api/auth/reset-password (público)
router.post("/reset-password", resetPassword);

export default router;
