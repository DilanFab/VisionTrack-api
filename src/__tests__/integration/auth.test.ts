// Mocks antes de imports (jest.mock se hoisted)
jest.mock("node-fetch", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../../middlewares/rateLimit", () => ({
  authLimiter: (_req: any, _res: any, next: any) => next(),
  generalLimiter: (_req: any, _res: any, next: any) => next(),
}));
jest.mock("../../config/prisma", () => ({
  __esModule: true,
  default: require("jest-mock-extended").mockDeep(),
}));

jest.mock("../../services/email", () => ({
  enviarEmailResetPassword: jest.fn().mockResolvedValue(undefined),
}));

import prismaMock from "../../config/prisma";
import * as emailMock from "../../services/email";
import app from "../../app";
import request from "supertest";
import bcrypt from "bcryptjs";

beforeEach(() => {
  jest.clearAllMocks();
});

const mockPersona = {
  persona_id: 1,
  persona_cedula: "1234567890",
  persona_primer_nombre: "Juan",
  persona_segundo_nombre: null,
  persona_primer_apellido: "Perez",
  persona_segundo_apellido: null,
  persona_fecha_nacimiento: new Date("1990-01-01"),
  persona_direccion: "Calle 123",
  persona_telefono: "0991234567",
  persona_correo: "juan@test.com",
  persona_estado: "A" as const,
  genero_id: 1,
};

const mockUsuario = {
  usuario_id: 1,
  persona_id: 1,
  usuario_nombre: "juanp",
  usuario_contrasena: "",
  usuario_imagen: "default.png",
  usuario_estado: "A" as string,
  usuario_intentos: 0,
  usuario_cambiar_contrasena: 1,
};

const mockPerfil = {
  perfil_id: 1,
  usuario_id: 1,
  rol_id: 4,
  perfil_estado: "A" as string,
  rol: { rol_id: 4, rol_nombre: "Paciente" },
};

const makeUsuarioConPassword = async (password: string) => {
  const hashed = await bcrypt.hash(password, 10);
  return {
    ...mockUsuario,
    usuario_contrasena: hashed,
    persona: mockPersona,
    perfiles: [mockPerfil],
  };
};

describe("Auth - Integración", () => {
  // ─── LOGIN ──────────────────────────────────────────────
  describe("POST /api/auth/login", () => {
    it("login con credenciales válidas devuelve tokens", async () => {
      const user = await makeUsuarioConPassword("password123");
      (prismaMock.tbl_usuario.findFirst as any).mockResolvedValue(user);
      (prismaMock.tbl_usuario.update as any).mockResolvedValue({});

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "juan@test.com", password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      expect(res.body.usuario.persona.nombre).toBe("Juan Perez");
    });

    it("login con contraseña incorrecta retorna 401", async () => {
      const user = await makeUsuarioConPassword("password123");
      (prismaMock.tbl_usuario.findFirst as any).mockResolvedValue(user);
      (prismaMock.tbl_usuario.update as any).mockResolvedValue({});

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "juan@test.com", password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain("Credenciales incorrectas");
    });

    it("login con cuenta bloqueada retorna 423", async () => {
      const user = await makeUsuarioConPassword("password123");
      user.usuario_estado = "I";
      (prismaMock.tbl_usuario.findFirst as any).mockResolvedValue(user);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "juan@test.com", password: "password123" });

      expect(res.status).toBe(423);
      expect(res.body.error).toContain("Cuenta bloqueada");
    });

    it("login con email no registrado retorna 401", async () => {
      (prismaMock.tbl_usuario.findFirst as any).mockResolvedValue(null);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "noexiste@test.com", password: "password123" });

      expect(res.status).toBe(401);
    });

    it("login con body inválido (Zod) retorna 400", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "no-email", password: "short" });

      expect(res.status).toBe(400);
    });
  });

  // ─── REGISTER ────────────────────────────────────────────
  describe("POST /api/auth/register", () => {
    const validBody = {
      tipo: "paciente",
      cedula: "1234567890",
      primer_nombre: "Juan",
      primer_apellido: "Perez",
      fecha_nacimiento: "1990-01-01",
      direccion: "Calle 123",
      telefono: "0991234567",
      correo: "juan@test.com",
      genero_id: 1,
      usuario_nombre: "juanp",
      usuario_contrasena: "password123",
    };

    it("registro válido devuelve tokens", async () => {
      (prismaMock.tbl_persona.findUnique as any).mockResolvedValue(null);
      (prismaMock.tbl_persona.findFirst as any).mockResolvedValue(null);
      (prismaMock.tbl_usuario.findUnique as any).mockResolvedValue(null);
      (prismaMock.$transaction as any).mockResolvedValue({
        persona: { ...mockPersona, persona_id: 1 },
        usuario: { ...mockUsuario, usuario_id: 1 },
        perfil: mockPerfil,
      });

      const res = await request(app)
        .post("/api/auth/register")
        .send(validBody);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
    });

    it("registro con cédula duplicada retorna 400", async () => {
      (prismaMock.tbl_persona.findUnique as any).mockResolvedValue(mockPersona);

      const res = await request(app)
        .post("/api/auth/register")
        .send(validBody);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("cédula");
    });

    it("registro con body inválido (Zod) retorna 400", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ tipo: "paciente" });

      expect(res.status).toBe(400);
    });
  });

  // ─── REFRESH ────────────────────────────────────────────
  describe("POST /api/auth/refresh", () => {
    it("refresh con token válido devuelve nuevos tokens", async () => {
      const jwt = require("jsonwebtoken");
      const token = jwt.sign(
        { usuario_id: 1, usuario_nombre: "juanp", email: "juan@test.com", roles: ["Paciente"] },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const res = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: token });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
    });

    it("refresh con token inválido retorna 401", async () => {
      const res = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: "token-basura" });

      expect(res.status).toBe(401);
    });

    it("refresh sin token retorna 400 (Zod)", async () => {
      const res = await request(app)
        .post("/api/auth/refresh")
        .send({});

      expect(res.status).toBe(400);
    });
  });

  // ─── FORGOT PASSWORD ────────────────────────────────────
  describe("POST /api/auth/forgot-password", () => {
    it("forgot-password con email válido retorna 200", async () => {
      (prismaMock.tbl_usuario.findFirst as any).mockResolvedValue({
        ...mockUsuario,
        persona: mockPersona,
      });
      (prismaMock.tbl_reset_token.create as any).mockResolvedValue({});

      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "juan@test.com" });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("Si el correo existe");
    });

    it("forgot-password con email inexistente retorna 200 (no revela)", async () => {
      (prismaMock.tbl_usuario.findFirst as any).mockResolvedValue(null);

      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "noexiste@test.com" });

      expect(res.status).toBe(200);
    });
  });

  // ─── RESET PASSWORD ────────────────────────────────────
  describe("POST /api/auth/reset-password", () => {
    it("reset-password con token válido retorna 200", async () => {
      (prismaMock.tbl_reset_token.findFirst as any).mockResolvedValue({
        reset_token_id: 1,
        usuario_id: 1,
        reset_token_usado: false,
        reset_token_expires_at: new Date(Date.now() + 3600000),
      });
      (prismaMock.tbl_usuario.update as any).mockResolvedValue({});
      (prismaMock.tbl_reset_token.update as any).mockResolvedValue({});

      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({ token: "valid-token", password: "nuevaPassword123" });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("actualizada");
    });

    it("reset-password con token inválido retorna 400", async () => {
      (prismaMock.tbl_reset_token.findFirst as any).mockResolvedValue(null);

      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({ token: "invalid-token", password: "nuevaPassword123" });

      expect(res.status).toBe(400);
    });
  });
});
