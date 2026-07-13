import { Router } from "express";
import { login, register } from "../controllers/authController";
import { authLimiter } from "../middlewares/rateLimit";

const router = Router();

// POST /api/auth/login
router.post("/login", authLimiter, login);

// POST /api/auth/register
router.post("/register", authLimiter, register);

export default router;
