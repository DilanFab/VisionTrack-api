jest.mock("../config/prisma", () => ({
  __esModule: true,
  default: require("jest-mock-extended").mockDeep(),
}));

process.env.JWT_SECRET = "test-secret-key-for-jest-unit-tests";

import prismaMock from "../config/prisma";
import * as authService from "./authService";
import bcrypt from "bcryptjs";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("authService", () => {
  describe("login", () => {
    const mockUsuario = {
      usuario_id: 1,
      usuario_nombre: "testuser",
      usuario_contrasena: "",
      usuario_imagen: "default.png",
      usuario_intentos: 0,
      usuario_cambiar_contrasena: 1,
      usuario_estado: "A",
      persona: {
        persona_cedula: "1234567890",
        persona_primer_nombre: "Juan",
        persona_primer_apellido: "Perez",
        persona_correo: "juan@test.com",
      },
      perfiles: [
        {
          perfil_id: 1,
          rol: { rol_nombre: "Paciente" },
        },
      ],
    };

    it("login con credenciales validas devuelve tokens", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      const user = { ...mockUsuario, usuario_contrasena: hashedPassword };
      (prismaMock.tbl_usuario.findFirst as any).mockResolvedValue(user);
      (prismaMock.tbl_usuario.update as any).mockResolvedValue({});

      const result = await authService.login({
        email: "juan@test.com",
        password: "password123",
      });

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result.usuario.usuario_id).toBe(1);
      expect(result.usuario.roles).toContain("Paciente");
    });

    it("login con email inexistente lanza 401", async () => {
      (prismaMock.tbl_usuario.findFirst as any).mockResolvedValue(null);

      await expect(
        authService.login({ email: "noexiste@test.com", password: "password123" })
      ).rejects.toMatchObject({ status: 401 });
    });

    it("login con cuenta bloqueada lanza 423", async () => {
      const user = { ...mockUsuario, usuario_estado: "I" };
      (prismaMock.tbl_usuario.findFirst as any).mockResolvedValue(user);

      await expect(
        authService.login({ email: "juan@test.com", password: "password123" })
      ).rejects.toMatchObject({ status: 423 });
    });

    it("login con contrasena incorrecta incrementa intentos", async () => {
      const hashedPassword = await bcrypt.hash("correcta123", 10);
      const user = { ...mockUsuario, usuario_contrasena: hashedPassword, usuario_intentos: 0 };
      (prismaMock.tbl_usuario.findFirst as any).mockResolvedValue(user);
      (prismaMock.tbl_usuario.update as any).mockResolvedValue({});

      await expect(
        authService.login({ email: "juan@test.com", password: "mala1234" })
      ).rejects.toMatchObject({ status: 401 });

      expect(prismaMock.tbl_usuario.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ usuario_intentos: 1 }),
        })
      );
    });

    it("login con 4 intentos fallidos bloquea la cuenta", async () => {
      const hashedPassword = await bcrypt.hash("correcta123", 10);
      const user = { ...mockUsuario, usuario_contrasena: hashedPassword, usuario_intentos: 4 };
      (prismaMock.tbl_usuario.findFirst as any).mockResolvedValue(user);
      (prismaMock.tbl_usuario.update as any).mockResolvedValue({});

      await expect(
        authService.login({ email: "juan@test.com", password: "mala1234" })
      ).rejects.toMatchObject({ status: 401 });

      expect(prismaMock.tbl_usuario.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ usuario_intentos: 5, usuario_estado: "I" }),
        })
      );
    });

    it("login exitoso resetea intentos a 0", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      const user = { ...mockUsuario, usuario_contrasena: hashedPassword, usuario_intentos: 3 };
      (prismaMock.tbl_usuario.findFirst as any).mockResolvedValue(user);
      (prismaMock.tbl_usuario.update as any).mockResolvedValue({});

      await authService.login({ email: "juan@test.com", password: "password123" });

      expect(prismaMock.tbl_usuario.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { usuario_intentos: 0 },
        })
      );
    });

    it("login con email invalido lanza 400", async () => {
      await expect(
        authService.login({ email: "", password: "12345678" })
      ).rejects.toMatchObject({ status: 400 });
    });
  });

  describe("register", () => {
    it("register valido devuelve tokens", async () => {
      (prismaMock.tbl_persona.findUnique as any).mockResolvedValue(null);
      (prismaMock.tbl_persona.findFirst as any).mockResolvedValue(null);
      (prismaMock.tbl_usuario.findUnique as any).mockResolvedValue(null);
      (prismaMock.$transaction as any).mockImplementation(async (cb: any) => {
        const tx = {
          tbl_persona: { create: jest.fn().mockResolvedValue({ persona_id: 1, persona_cedula: "1234567890", persona_primer_nombre: "Juan", persona_primer_apellido: "Perez", persona_correo: "juan@test.com" }) },
          tbl_usuario: { create: jest.fn().mockResolvedValue({ usuario_id: 1, usuario_nombre: "testuser", usuario_imagen: "default.png" }) },
          tbl_perfil: { create: jest.fn().mockResolvedValue({ perfil_id: 1, rol: { rol_nombre: "Paciente" } }) },
          tbl_historia_clinica: { create: jest.fn().mockResolvedValue({}) },
        };
        return cb(tx);
      });

      const result = await authService.register({
        tipo: "paciente",
        cedula: "1234567890",
        primer_nombre: "Juan",
        primer_apellido: "Perez",
        fecha_nacimiento: "1990-01-01",
        direccion: "Calle 123",
        telefono: "0991234567",
        correo: "juan@test.com",
        genero_id: 1,
        usuario_nombre: "testuser",
        usuario_contrasena: "password123",
      });

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
    });

    it("register con cedula duplicada lanza 400", async () => {
      (prismaMock.tbl_persona.findUnique as any).mockResolvedValue({ persona_id: 1 });

      await expect(
        authService.register({
          tipo: "paciente",
          cedula: "1234567890",
          primer_nombre: "Juan",
          primer_apellido: "Perez",
          fecha_nacimiento: "1990-01-01",
          direccion: "Calle 123",
          telefono: "0991234567",
          correo: "juan@test.com",
          genero_id: 1,
          usuario_nombre: "testuser",
          usuario_contrasena: "password123",
        })
      ).rejects.toMatchObject({ status: 400 });
    });
  });

  describe("refresh", () => {
    it("refresh con token valido devuelve nuevos tokens", async () => {
      const jwt = require("jsonwebtoken");
      const token = jwt.sign(
        { usuario_id: 1, usuario_nombre: "test", email: "test@test.com", roles: ["Paciente"] },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const result = await authService.refresh({ refreshToken: token });

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
    });

    it("refresh con token invalido lanza 401", async () => {
      await expect(
        authService.refresh({ refreshToken: "tokeninvalido" })
      ).rejects.toMatchObject({ status: 401 });
    });
  });
});
