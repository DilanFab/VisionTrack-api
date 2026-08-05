import { Router } from "express";
import { login, register, refresh, forgotPassword, resetPassword, getNavigation } from "../controllers/authController";
import { verifyToken } from "../middlewares/auth";
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

// GET /api/auth/navigation
router.get("/navigation", verifyToken, getNavigation);

export default router;
