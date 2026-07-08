import { Router } from "express";
import { uploadImagenUsuario, uploadImagenPaciente } from "../../middlewares/upload";
import { subirImagenUsuario, subirImagenPaciente } from "../../controllers/usuarios/uploadController";

const router = Router();

router.post("/imagen", uploadImagenUsuario.single("imagen"), subirImagenUsuario);
router.post("/imagen-paciente", uploadImagenPaciente.single("imagen"), subirImagenPaciente);

export default router;
