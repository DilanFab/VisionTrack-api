jest.mock("../config/prisma", () => ({
  __esModule: true,
  default: require("jest-mock-extended").mockDeep(),
}));

import prismaMock from "../config/prisma";
import * as pacienteService from "./pacienteCompletoService";
import bcrypt from "bcryptjs";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("pacienteCompletoService", () => {
  describe("crear", () => {
    it("crea paciente completo con transaccion", async () => {
      (prismaMock.tbl_persona.findUnique as any).mockResolvedValue(null);
      (prismaMock.tbl_usuario.findUnique as any).mockResolvedValue(null);
      (prismaMock.tbl_rol.findUnique as any).mockResolvedValue({ rol_id: 4, rol_nombre: "Paciente" });

      (prismaMock.$transaction as any).mockImplementation(async (cb: any) => {
        const tx = {
          tbl_persona: { create: jest.fn().mockResolvedValue({ persona_id: 1 }) },
          tbl_usuario: { create: jest.fn().mockResolvedValue({ usuario_id: 1 }) },
          tbl_perfil: { create: jest.fn().mockResolvedValue({ perfil_id: 1 }) },
          tbl_historia_clinica: {
            findMany: jest.fn().mockResolvedValue([]),
            create: jest.fn().mockResolvedValue({ historia_clinica_id: 1, historia_clinica_numero: "HC-001" }),
          },
        };
        return cb(tx);
      });

      (prismaMock.tbl_historia_clinica.findUnique as any).mockResolvedValue({ historia_clinica_id: 1 });

      const result = await pacienteService.crear({
        genero_id: 1,
        persona_cedula: "1234567890",
        persona_primer_nombre: "Juan",
        persona_primer_apellido: "Perez",
        persona_fecha_nacimiento: "1990-01-01",
        persona_direccion: "Calle 123",
        persona_telefono: "0991234567",
        persona_correo: "juan@test.com",
        usuario_nombre: "juanp",
        usuario_contrasena: "test12345",
      });

      expect(result).toHaveProperty("historia_clinica_id", 1);
    });

    it("lanza error si cedula ya existe", async () => {
      (prismaMock.tbl_persona.findUnique as any).mockResolvedValue({ persona_id: 1 });

      await expect(
        pacienteService.crear({
          genero_id: 1,
          persona_cedula: "1234567890",
          persona_primer_nombre: "Juan",
          persona_primer_apellido: "Perez",
          persona_fecha_nacimiento: "1990-01-01",
          persona_direccion: "Calle 123",
          persona_telefono: "0991234567",
          persona_correo: "juan@test.com",
          usuario_nombre: "juanp",
          usuario_contrasena: "test12345",
        })
      ).rejects.toThrow("c\u00e9dula");
    });
  });
});
