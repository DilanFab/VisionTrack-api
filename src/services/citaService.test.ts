jest.mock("../config/prisma", () => ({
  __esModule: true,
  default: require("jest-mock-extended").mockDeep(),
}));

import prismaMock from "../config/prisma";
import * as citaService from "./citaService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("citaService", () => {
  describe("existeConflictoDeHorario", () => {
    it("retorna true si hay conflicto", async () => {
      (prismaMock.tbl_cita.findFirst as any).mockResolvedValue({ cita_id: 1 });
      const result = await citaService.existeConflictoDeHorario(1, new Date());
      expect(result).toBe(true);
    });

    it("retorna false si no hay conflicto", async () => {
      (prismaMock.tbl_cita.findFirst as any).mockResolvedValue(null);
      const result = await citaService.existeConflictoDeHorario(1, new Date());
      expect(result).toBe(false);
    });
  });

  describe("crear", () => {
    it("crea cita sin conflicto", async () => {
      (prismaMock.tbl_cita.findFirst as any).mockResolvedValue(null);
      (prismaMock.tbl_estado_cita.findFirst as any).mockResolvedValue({ estado_cita_id: 1, estado_cita_nombre: "Programada" });
      (prismaMock.tbl_cita.create as any).mockResolvedValue({ cita_id: 1 });

      const result = await citaService.crear({
        horario_doctor_id: 1,
        historia_clinica_id: 1,
        cita_fecha: "2026-07-15",
        cita_motivo: "Examen general",
      });

      expect(result).toHaveProperty("cita_id", 1);
    });

    it("lanza error si hay conflicto de horario", async () => {
      (prismaMock.tbl_cita.findFirst as any).mockResolvedValue({ cita_id: 2 });

      await expect(
        citaService.crear({
          horario_doctor_id: 1,
          historia_clinica_id: 1,
          cita_fecha: "2026-07-15",
          cita_motivo: "Examen",
        })
      ).rejects.toThrow("El doctor ya tiene una cita agendada");
    });
  });

  describe("cancelar", () => {
    it("cancela cita existente", async () => {
      (prismaMock.tbl_estado_cita.findFirst as any).mockResolvedValue({ estado_cita_id: 2, estado_cita_nombre: "Cancelada" });
      (prismaMock.tbl_cita.update as any).mockResolvedValue({ cita_id: 1, estado_cita_id: 2 });

      const result = await citaService.cancelar(1);

      expect(result).toHaveProperty("cita_id", 1);
    });
  });
});
