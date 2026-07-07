import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../config/prisma";

const ROL_MEDICO = "Médico";

const doctorCompletoInclude = {
  especialidad_medica: true,
  perfil: {
    include: {
      usuario: {
        include: { persona: true },
      },
    },
  },
};

// GET /api/doctores-completos
export const getDoctoresCompletos = async (req: Request, res: Response) => {
  try {
    const doctores = await prisma.tbl_doctor.findMany({
      include: doctorCompletoInclude,
    });
    res.json(doctores);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los doctores" });
  }
};

// POST /api/doctores-completos
export const createDoctorCompleto = async (req: Request, res: Response) => {
  try {
    const {
      genero_id,
      persona_cedula,
      persona_primer_nombre,
      persona_segundo_nombre,
      persona_primer_apellido,
      persona_segundo_apellido,
      persona_fecha_nacimiento,
      persona_direccion,
      persona_telefono,
      persona_correo,
      usuario_nombre,
      usuario_contrasena,
      usuario_imagen,
      especialidad_medica_id,
    } = req.body;

    const cedulaExistente = await prisma.tbl_persona.findUnique({
      where: { persona_cedula },
    });
    if (cedulaExistente) {
      res.status(400).json({ error: "Ya existe una persona con esa cédula" });
      return;
    }

    const usuarioExistente = await prisma.tbl_usuario.findUnique({
      where: { usuario_nombre },
    });
    if (usuarioExistente) {
      res.status(400).json({ error: "Ese nombre de usuario ya está en uso" });
      return;
    }

    const rolMedico = await prisma.tbl_rol.findUnique({ where: { rol_nombre: ROL_MEDICO } });
    if (!rolMedico) {
      res.status(500).json({ error: "No se encontró el rol Médico" });
      return;
    }

    const hashedPassword = await bcrypt.hash(usuario_contrasena, 10);

    const doctorId = await prisma.$transaction(async (tx) => {
      const persona = await tx.tbl_persona.create({
        data: {
          genero_id: Number(genero_id),
          persona_cedula,
          persona_primer_nombre,
          persona_segundo_nombre: persona_segundo_nombre || null,
          persona_primer_apellido,
          persona_segundo_apellido: persona_segundo_apellido || null,
          persona_fecha_nacimiento: new Date(persona_fecha_nacimiento),
          persona_direccion,
          persona_telefono,
          persona_correo,
          persona_estado: "A",
        },
      });

      const usuario = await tx.tbl_usuario.create({
        data: {
          persona_id: persona.persona_id,
          usuario_nombre,
          usuario_contrasena: hashedPassword,
          usuario_imagen: usuario_imagen || "default.png",
          usuario_estado: "A",
        },
      });

      const perfil = await tx.tbl_perfil.create({
        data: {
          usuario_id: usuario.usuario_id,
          rol_id: rolMedico.rol_id,
          perfil_estado: "A",
        },
      });

      const doctor = await tx.tbl_doctor.create({
        data: {
          perfil_id: perfil.perfil_id,
          especialidad_medica_id: Number(especialidad_medica_id),
          doctor_estado: "A",
        },
      });

      return doctor.doctor_id;
    });

    const doctorCreado = await prisma.tbl_doctor.findUnique({
      where: { doctor_id: doctorId },
      include: doctorCompletoInclude,
    });
    res.status(201).json(doctorCreado);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el doctor" });
  }
};

// PUT /api/doctores-completos/:id  (id = doctor_id)
export const updateDoctorCompleto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      genero_id,
      persona_cedula,
      persona_primer_nombre,
      persona_segundo_nombre,
      persona_primer_apellido,
      persona_segundo_apellido,
      persona_fecha_nacimiento,
      persona_direccion,
      persona_telefono,
      persona_correo,
      usuario_nombre,
      usuario_contrasena,
      usuario_imagen,
      especialidad_medica_id,
      doctor_estado,
    } = req.body;

    const doctorActual = await prisma.tbl_doctor.findUnique({
      where: { doctor_id: Number(id) },
      include: { perfil: { include: { usuario: true } } },
    });
    if (!doctorActual) {
      res.status(404).json({ error: "Doctor no encontrado" });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.tbl_persona.update({
        where: { persona_id: doctorActual.perfil.usuario.persona_id },
        data: {
          genero_id: Number(genero_id),
          persona_cedula,
          persona_primer_nombre,
          persona_segundo_nombre: persona_segundo_nombre || null,
          persona_primer_apellido,
          persona_segundo_apellido: persona_segundo_apellido || null,
          persona_fecha_nacimiento: new Date(persona_fecha_nacimiento),
          persona_direccion,
          persona_telefono,
          persona_correo,
        },
      });

      const usuarioData: Record<string, unknown> = {
        usuario_nombre,
        usuario_imagen,
      };
      if (usuario_contrasena) {
        usuarioData.usuario_contrasena = await bcrypt.hash(usuario_contrasena, 10);
      }

      await tx.tbl_usuario.update({
        where: { usuario_id: doctorActual.perfil.usuario_id },
        data: usuarioData,
      });

      await tx.tbl_doctor.update({
        where: { doctor_id: Number(id) },
        data: {
          especialidad_medica_id: Number(especialidad_medica_id),
          doctor_estado,
        },
      });
    });

    const doctorActualizado = await prisma.tbl_doctor.findUnique({
      where: { doctor_id: Number(id) },
      include: doctorCompletoInclude,
    });
    res.json(doctorActualizado);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el doctor" });
  }
};

// DELETE /api/doctores-completos/:id (borrado lógico del doctor)
export const deleteDoctorCompleto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doctor = await prisma.tbl_doctor.update({
      where: { doctor_id: Number(id) },
      data: { doctor_estado: "I" },
    });
    res.json({ message: "Doctor desactivado correctamente", doctor });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el doctor" });
  }
};
