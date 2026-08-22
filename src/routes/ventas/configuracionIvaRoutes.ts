import { Router } from "express";
import {
  getConfiguracionesIva,
  getConfiguracionIvaById,
  createConfiguracionIva,
  updateConfiguracionIva,
  deleteConfiguracionIva,
} from "../../controllers/ventas/configuracionIvaController";
import { verifyToken } from "../../middlewares/auth";
import { authorize } from "../../middlewares/auth";

const router = Router();

// GET /api/configuracion-iva              — Público (la app de facturación lo consume al cargar)
// GET /api/configuracion-iva?soloActivos=true — filtra solo las tarifas activas
router.get("/", getConfiguracionesIva);

// GET /api/configuracion-iva/:id          — Admin
router.get("/:id", verifyToken, authorize("Administrador"), getConfiguracionIvaById);

// POST /api/configuracion-iva             — Solo Admin
router.post("/", verifyToken, authorize("Administrador"), createConfiguracionIva);

// PUT /api/configuracion-iva/:id          — Solo Admin (activar/desactivar para feriados, etc.)
router.put("/:id", verifyToken, authorize("Administrador"), updateConfiguracionIva);

// DELETE /api/configuracion-iva/:id       — Solo Admin (borrado lógico)
router.delete("/:id", verifyToken, authorize("Administrador"), deleteConfiguracionIva);

export default router;
