import { Router } from "express";
import { login, register, refresh } from "../controllers/authController";
import { authLimiter } from "../middlewares/rateLimit";

const router = Router();

// POST /api/auth/login
router.post("/login", authLimiter, login);

// POST /api/auth/register
router.post("/register", authLimiter, register);

// POST /api/auth/refresh
router.post("/refresh", authLimiter, refresh);

export default router;
