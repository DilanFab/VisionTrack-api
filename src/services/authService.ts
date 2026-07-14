import prisma from "../config/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { loginSchema, registerSchema, refreshSchema } from "../validations/auth.schema";

const JWT_SECRET = process.env.JWT_SECRET!;

const ACCESS_EXPIRY = "15m";
const REFRESH_EXPIRY = "7d";
const INTENTOS_MAXIMOS = 5;

const signTokens = (payload: object) => {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRY });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_EXPIRY });
  return { accessToken, refreshToken };
};

export const login = async (body: unknown) => {
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    throw { status: 400, message: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;

  const usuario = await prisma.tbl_usuario.findFirst({
    where: { persona: { persona_correo: email } },
    include: {
      persona: true,
      perfiles: {
        where: { perfil_estado: "A" },
        include: { rol: true },
      },
    },
  });

  if (!usuario) throw { status: 401, message: "Credenciales incorrectas" };
  if (usuario.usuario_estado === "I") throw { status: 423, message: "Cuenta bloqueada. Contacta al administrador." };

  const contrasenaValida = await bcrypt.compare(password, usuario.usuario_contrasena);
  if (!contrasenaValida) {
    const nuevosIntentos = usuario.usuario_intentos + 1;
    const data: { usuario_intentos: number; usuario_estado?: string } = { usuario_intentos: nuevosIntentos };
    if (nuevosIntentos >= INTENTOS_MAXIMOS) data.usuario_estado = "I";
    await prisma.tbl_usuario.update({ where: { usuario_id: usuario.usuario_id }, data });
    const msg = nuevosIntentos >= INTENTOS_MAXIMOS
      ? "Cuenta bloqueada por exceso de intentos. Contacta al administrador."
      : `Credenciales incorrectas. Te quedan ${INTENTOS_MAXIMOS - nuevosIntentos} intentos.`;
    throw { status: 401, message: msg };
  }

  if (usuario.usuario_intentos > 0) {
    await prisma.tbl_usuario.update({
      where: { usuario_id: usuario.usuario_id },
      data: { usuario_intentos: 0 },
    });
  }

  const roles = usuario.perfiles.map((p) => p.rol.rol_nombre);
  if (roles.length === 0) throw { status: 403, message: "El usuario no tiene roles asignados o perfiles activos" };

  const payload = {
    usuario_id: usuario.usuario_id,
    usuario_nombre: usuario.usuario_nombre,
    email: usuario.persona.persona_correo,
    roles,
  };
  const { accessToken, refreshToken } = signTokens(payload);

  return {
    accessToken,
    refreshToken,
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
  };
};

export const register = async (body: unknown) => {
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    throw { status: 400, message: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  const cedulaExiste = await prisma.tbl_persona.findUnique({ where: { persona_cedula: data.cedula } });
  if (cedulaExiste) throw { status: 400, message: "La cédula ingresada ya está registrada en el sistema" };

  const correoExiste = await prisma.tbl_persona.findFirst({ where: { persona_correo: data.correo } });
  if (correoExiste) throw { status: 400, message: "El correo electrónico ya está registrado en el sistema" };

  const usuarioExiste = await prisma.tbl_usuario.findUnique({ where: { usuario_nombre: data.usuario_nombre } });
  if (usuarioExiste) throw { status: 400, message: "El nombre de usuario ya está en uso" };

  const hashedPassword = await bcrypt.hash(data.usuario_contrasena, 10);
  const finalImagen = data.usuario_imagen || "default.png";

  const resultado = await prisma.$transaction(async (tx) => {
    const persona = await tx.tbl_persona.create({
      data: {
        genero_id: data.genero_id,
        persona_cedula: data.cedula,
        persona_primer_nombre: data.primer_nombre,
        persona_segundo_nombre: data.segundo_nombre || null,
        persona_primer_apellido: data.primer_apellido,
        persona_segundo_apellido: data.segundo_apellido || null,
        persona_fecha_nacimiento: new Date(data.fecha_nacimiento),
        persona_direccion: data.direccion,
        persona_telefono: data.telefono,
        persona_correo: data.correo,
        persona_estado: "A",
      },
    });

    const usuario = await tx.tbl_usuario.create({
      data: {
        persona_id: persona.persona_id,
        usuario_nombre: data.usuario_nombre,
        usuario_contrasena: hashedPassword,
        usuario_imagen: finalImagen,
        usuario_estado: "A",
      },
    });

    const rolId = data.tipo === "doctor" ? 3 : 4;
    const perfil = await tx.tbl_perfil.create({
      data: {
        usuario_id: usuario.usuario_id,
        rol_id: rolId,
        perfil_estado: "A",
      },
      include: { rol: true },
    });

    if (data.tipo === "doctor") {
      await tx.tbl_doctor.create({
        data: {
          perfil_id: perfil.perfil_id,
          especialidad_medica_id: Number(data.especialidad_medica_id),
          doctor_estado: "A",
        },
      });
    } else {
      const hcNumero = `HC-${data.cedula}`;
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

  const roles = [resultado.perfil.rol.rol_nombre];
  const payload = {
    usuario_id: resultado.usuario.usuario_id,
    usuario_nombre: resultado.usuario.usuario_nombre,
    email: resultado.persona.persona_correo,
    roles,
  };
  const { accessToken, refreshToken } = signTokens(payload);

  return {
    accessToken,
    refreshToken,
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
  };
};

export const refresh = async (body: unknown) => {
  const parsed = refreshSchema.safeParse(body);
  if (!parsed.success) {
    throw { status: 400, message: parsed.error.issues[0].message };
  }

  try {
    const decoded = jwt.verify(parsed.data.refreshToken, JWT_SECRET);
    const payload = {
      usuario_id: (decoded as any).usuario_id,
      usuario_nombre: (decoded as any).usuario_nombre,
      email: (decoded as any).email,
      roles: (decoded as any).roles,
    };
    return signTokens(payload);
  } catch {
    throw { status: 401, message: "Refresh token inválido o expirado" };
  }
};
