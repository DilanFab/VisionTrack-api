import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";

const router = Router();

router.use("/", swaggerUi.serve);
router.get("/", swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: "VisionTrack API Docs",
}));

export default router;
