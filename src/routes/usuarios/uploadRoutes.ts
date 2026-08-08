import { Router } from "express";
import { verifyToken } from "../../middlewares/auth";
import { uploadImagenUsuario, uploadImagenPaciente } from "../../middlewares/upload";
import { validateUpload } from "../../middlewares/validateUpload";
import { subirImagenUsuario, subirImagenPaciente } from "../../controllers/usuarios/uploadController";

const router = Router();

router.post("/imagen", verifyToken, uploadImagenUsuario.single("imagen"), validateUpload, subirImagenUsuario);
router.post("/imagen-paciente", uploadImagenPaciente.single("imagen"), validateUpload, subirImagenPaciente);

export default router;
