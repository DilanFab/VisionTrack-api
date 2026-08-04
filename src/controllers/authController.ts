import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { JWT_SECRET } from "../config/jwt";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "El correo y la contraseña son requeridos" });
      return;
    }

    // Buscar al usuario a través de la relación de persona_correo
    const usuario = await prisma.tbl_usuario.findFirst({
      where: {
        persona: {
          persona_correo: email,
        },
        usuario_estado: "A",
      },
      include: {
        persona: true,
        perfiles: {
          where: {
            perfil_estado: "A",
          },
          include: {
            rol: true,
          },
        },
      },
    });

    if (!usuario) {
      res.status(401).json({ error: "Credenciales incorrectas" });
      return;
    }

    // Verificar contraseña
    const contrasenaValida = await bcrypt.compare(password, usuario.usuario_contrasena);
    if (!contrasenaValida) {
      res.status(401).json({ error: "Credenciales incorrectas" });
      return;
    }

    // Extraer los roles asignados
    const roles = usuario.perfiles.map(p => p.rol.rol_nombre);

    if (roles.length === 0) {
      res.status(403).json({ error: "El usuario no tiene roles asignados o perfiles activos" });
      return;
    }

    // Generar Token JWT
    const token = jwt.sign(
      {
        usuario_id: usuario.usuario_id,
        usuario_nombre: usuario.usuario_nombre,
        email: usuario.persona.persona_correo,
        roles,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Responder con datos de usuario y token
    res.json({
      token,
      usuario: {
        usuario_id: usuario.usuario_id,
        usuario_nombre: usuario.usuario_nombre,
        usuario_imagen: usuario.usuario_imagen,
        persona: {
          cedula: usuario.persona.persona_cedula,
          nombre: `${usuario.persona.persona_primer_nombre} ${usuario.persona.persona_primer_apellido}`,
          correo: usuario.persona.persona_correo,
        },
        roles,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor al iniciar sesión" });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const {
      tipo, // "paciente" | "doctor"
      cedula,
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      fecha_nacimiento,
      direccion,
      telefono,
      correo,
      genero_id,
      usuario_nombre,
      usuario_contrasena,
      usuario_imagen,
      especialidad_medica_id, // Solo para doctor
    } = req.body;

    // Validación básica de campos requeridos
    if (
      !tipo ||
      !cedula ||
      !primer_nombre ||
      !primer_apellido ||
      !fecha_nacimiento ||
      !direccion ||
      !telefono ||
      !correo ||
      !genero_id ||
      !usuario_nombre ||
      !usuario_contrasena
    ) {
      res.status(400).json({ error: "Todos los campos obligatorios deben ser completados" });
      return;
    }

    if (tipo === "doctor" && !especialidad_medica_id) {
      res.status(400).json({ error: "La especialidad médica es obligatoria para registrarse como Doctor" });
      return;
    }

    // 1. Validar que no existan duplicados
    const cedulaExiste = await prisma.tbl_persona.findUnique({
      where: { persona_cedula: cedula },
    });
    if (cedulaExiste) {
      res.status(400).json({ error: "La cédula ingresada ya está registrada en el sistema" });
      return;
    }

    const correoExiste = await prisma.tbl_persona.findFirst({
      where: { persona_correo: correo },
    });
    if (correoExiste) {
      res.status(400).json({ error: "El correo electrónico ya está registrado en el sistema" });
      return;
    }

    const usuarioExiste = await prisma.tbl_usuario.findUnique({
      where: { usuario_nombre },
    });
    if (usuarioExiste) {
      res.status(400).json({ error: "El nombre de usuario ya está en uso" });
      return;
    }

    // 2. Cifrar contraseña
    const hashedPassword = await bcrypt.hash(usuario_contrasena, 10);
    const finalImagen = usuario_imagen || "default.png";

    // 3. Ejecutar registro atómico en una transacción Prisma
    const resultado = await prisma.$transaction(async (tx) => {
      // A. Crear la persona
      const persona = await tx.tbl_persona.create({
        data: {
          genero_id: Number(genero_id),
          persona_cedula: cedula,
          persona_primer_nombre: primer_nombre,
          persona_segundo_nombre: segundo_nombre || null,
          persona_primer_apellido: primer_apellido,
          persona_segundo_apellido: segundo_apellido || null,
          persona_fecha_nacimiento: new Date(fecha_nacimiento),
          persona_direccion: direccion,
          persona_telefono: telefono,
          persona_correo: correo,
          persona_estado: "A",
        },
      });

      // B. Crear el usuario
      const usuario = await tx.tbl_usuario.create({
        data: {
          persona_id: persona.persona_id,
          usuario_nombre,
          usuario_contrasena: hashedPassword,
          usuario_imagen: finalImagen,
          usuario_estado: "A",
        },
      });

      // C. Determinar Rol (3 = Médico, 4 = Paciente)
      const rolId = tipo === "doctor" ? 3 : 4;
      const perfil = await tx.tbl_perfil.create({
        data: {
          usuario_id: usuario.usuario_id,
          rol_id: rolId,
          perfil_estado: "A",
        },
        include: {
          rol: true,
        },
      });

      // D. Crear registros específicos según el tipo
      if (tipo === "doctor") {
        await tx.tbl_doctor.create({
          data: {
            perfil_id: perfil.perfil_id,
            especialidad_medica_id: Number(especialidad_medica_id),
            doctor_estado: "A",
          },
        });
      } else {
        const hcNumero = `HC-${cedula}`;
        await tx.tbl_historia_clinica.create({
          data: {
            paciente_id: perfil.perfil_id,
            historia_clinica_numero: hcNumero,
            historia_clinica_fecha_apertura: new Date(),
            historia_clinica_estado: "A",
          },
        });
      }

      return { persona, usuario, perfil };
    });

    // 4. Firmar y retornar el token JWT para inicio de sesión inmediato
    const roles = [resultado.perfil.rol.rol_nombre];
    const token = jwt.sign(
      {
        usuario_id: resultado.usuario.usuario_id,
        usuario_nombre: resultado.usuario.usuario_nombre,
        email: resultado.persona.persona_correo,
        roles,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      token,
      usuario: {
        usuario_id: resultado.usuario.usuario_id,
        usuario_nombre: resultado.usuario.usuario_nombre,
        usuario_imagen: resultado.usuario.usuario_imagen,
        persona: {
          cedula: resultado.persona.persona_cedula,
          nombre: `${resultado.persona.persona_primer_nombre} ${resultado.persona.persona_primer_apellido}`,
          correo: resultado.persona.persona_correo,
        },
        roles,
      },
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error en el servidor al registrar el usuario" });
  }
};

