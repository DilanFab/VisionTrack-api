import { Router } from "express";
import { uploadImagenUsuario } from "../../middlewares/upload";
import { subirImagenUsuario } from "../../controllers/usuarios/uploadController";

const router = Router();

router.post("/imagen", uploadImagenUsuario.single("imagen"), subirImagenUsuario);

export default router;
