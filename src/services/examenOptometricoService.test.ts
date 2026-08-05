jest.mock("../config/prisma", () => ({
  __esModule: true,
  default: require("jest-mock-extended").mockDeep(),
}));

import prismaMock from "../config/prisma";
import * as examenService from "./examenOptometricoService";

beforeEach(() => {
  jest.clearAllMocks();
});

const mockHistoria = {
  historia_clinica_id: 1,
  paciente_id: 1,
  historia_clinica_numero: "HC-001",
  historia_clinica_fecha_apertura: new Date("2026-08-05"),
  historia_clinica_estado: "A",
};

const mockExamen = {
  examen_optometrico_id: 1,
  historia_clinica_id: 1,
  cita_id: null,
  examinador_id: 1,
  examen_estado: "B",
};

describe("examenOptometricoService", () => {
  describe("crear", () => {
    it("crea examen manual con historia clínica obligatoria y cita opcional", async () => {
      (prismaMock.tbl_historia_clinica.findFirst as any).mockResolvedValue(mockHistoria);
      (prismaMock.tbl_examen_optometrico.create as any).mockResolvedValue({ ...mockExamen, lensometria: { od: "test" } });

      const result = await examenService.crear({
        historia_clinica_id: 1,
        examen_motivo_consulta: "Control visual",
        lensometria: { od: "-1.00" },
      }, 1);

      expect(prismaMock.tbl_examen_optometrico.create).toHaveBeenCalled();
      expect(result).toHaveProperty("examen_optometrico_id", 1);
    });

    it("rechaza si falta historia_clinica_id", async () => {
      await expect(examenService.crear({ examen_motivo_consulta: "Control" }, 1)).rejects.toMatchObject({ status: 400 });
    });

    it("rechaza cita de otra historia clínica", async () => {
      (prismaMock.tbl_historia_clinica.findFirst as any).mockResolvedValue(mockHistoria);
      (prismaMock.tbl_cita.findUnique as any).mockResolvedValue({ cita_id: 5, historia_clinica_id: 99 });

      await expect(examenService.crear({ historia_clinica_id: 1, cita_id: 5 }, 1)).rejects.toMatchObject({ status: 400 });
    });
  });

  describe("actualizar", () => {
    it("no permite actualizar examen finalizado", async () => {
      (prismaMock.tbl_examen_optometrico.findUnique as any).mockResolvedValue({ ...mockExamen, examen_estado: "F" });

      await expect(examenService.actualizar(1, { examen_motivo_consulta: "Nuevo" })).rejects.toMatchObject({ status: 400 });
    });
  });

  describe("finalizar", () => {
    it("marca examen como finalizado", async () => {
      (prismaMock.tbl_examen_optometrico.findUnique as any).mockResolvedValue(mockExamen);
      (prismaMock.tbl_examen_optometrico.update as any).mockResolvedValue({ ...mockExamen, examen_estado: "F" });

      const result = await examenService.finalizar(1);

      expect(prismaMock.tbl_examen_optometrico.update).toHaveBeenCalledWith(expect.objectContaining({ data: { examen_estado: "F" } }));
      expect(result.examen_estado).toBe("F");
    });
  });

  describe("listar", () => {
    it("retorna respuesta paginada", async () => {
      (prismaMock.tbl_examen_optometrico.findMany as any).mockResolvedValue([mockExamen]);
      (prismaMock.tbl_examen_optometrico.count as any).mockResolvedValue(1);

      const result = await examenService.listar({ page: "1", limit: "20", historia_clinica_id: "1" });

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("pagination");
    });
  });
});
