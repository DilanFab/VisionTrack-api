jest.mock("../config/prisma", () => ({
  __esModule: true,
  default: require("jest-mock-extended").mockDeep(),
}));

import prismaMock from "../config/prisma";
import * as usuarioService from "./usuarioService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("usuarioService", () => {
  describe("listar", () => {
    it("retorna paginacion con datos", async () => {
      (prismaMock.tbl_usuario.findMany as any).mockResolvedValue([{ usuario_id: 1 }]);
      (prismaMock.tbl_usuario.count as any).mockResolvedValue(1);

      const result = await usuarioService.listar({ page: "1", limit: "20" });

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("pagination");
      expect(result.pagination.total).toBe(1);
    });
  });

  describe("obtenerPerfilPaciente", () => {
    it("retorna perfil si existe", async () => {
      (prismaMock.tbl_perfil.findFirst as any).mockResolvedValue({ perfil_id: 1 });
      const result = await usuarioService.obtenerPerfilPaciente(1);
      expect(result).not.toBeNull();
      expect(result?.perfil_id).toBe(1);
    });

    it("retorna null si no existe", async () => {
      (prismaMock.tbl_perfil.findFirst as any).mockResolvedValue(null);
      const result = await usuarioService.obtenerPerfilPaciente(999);
      expect(result).toBeNull();
    });
  });

  describe("obtenerHistoriaClinica", () => {
    it("retorna HC si existe", async () => {
      (prismaMock.tbl_historia_clinica.findFirst as any).mockResolvedValue({ historia_clinica_id: 1 });
      const result = await usuarioService.obtenerHistoriaClinica(1);
      expect(result).not.toBeNull();
    });

    it("retorna null si no existe HC activa", async () => {
      (prismaMock.tbl_historia_clinica.findFirst as any).mockResolvedValue(null);
      const result = await usuarioService.obtenerHistoriaClinica(999);
      expect(result).toBeNull();
    });
  });

  describe("obtenerOCrearHistoriaClinica", () => {
    it("retorna HC existente si ya existe", async () => {
      (prismaMock.tbl_historia_clinica.findFirst as any).mockResolvedValue({
        historia_clinica_id: 5,
        historia_clinica_numero: "HC-1234567890",
      });
      const result = await usuarioService.obtenerOCrearHistoriaClinica(1);
      expect(result).toHaveProperty("historia_clinica_id", 5);
      expect(prismaMock.tbl_historia_clinica.create).not.toHaveBeenCalled();
    });

    it("crea y retorna nueva HC si no existía", async () => {
      (prismaMock.tbl_historia_clinica.findFirst as any).mockResolvedValue(null);
      (prismaMock.tbl_perfil.findUnique as any).mockResolvedValue({
        perfil_id: 1,
        usuario: {
          persona: {
            persona_cedula: "1723456789",
          },
        },
      });
      (prismaMock.tbl_historia_clinica.findUnique as any).mockResolvedValue(null);
      (prismaMock.tbl_historia_clinica.create as any).mockResolvedValue({
        historia_clinica_id: 10,
        paciente_id: 1,
        historia_clinica_numero: "HC-1723456789",
      });

      const result = await usuarioService.obtenerOCrearHistoriaClinica(1);
      expect(result).toHaveProperty("historia_clinica_id", 10);
      expect(prismaMock.tbl_historia_clinica.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          paciente_id: 1,
          historia_clinica_numero: "HC-1723456789",
          historia_clinica_estado: "A",
        }),
      });
    });
  });
});
