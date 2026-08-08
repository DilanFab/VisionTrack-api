jest.mock("../config/prisma", () => ({
  __esModule: true,
  default: require("jest-mock-extended").mockDeep(),
}));

import prismaMock from "../config/prisma";
import * as horarioService from "./horarioDoctorService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("horarioDoctorService", () => {
  describe("listarPorDoctor", () => {
    it("retorna horarios de un doctor", async () => {
      (prismaMock.tbl_horario_doctor.findMany as any).mockResolvedValue([
        { horario_doctor_id: 1, horario_doctor_dia: "Lunes" },
        { horario_doctor_id: 2, horario_doctor_dia: "Martes" },
      ]);

      const result = await horarioService.listarPorDoctor(1);
      expect(result).toHaveLength(2);
    });

    it("retorna array vacio si no hay horarios", async () => {
      (prismaMock.tbl_horario_doctor.findMany as any).mockResolvedValue([]);
      const result = await horarioService.listarPorDoctor(999);
      expect(result).toHaveLength(0);
    });
  });

  describe("reemplazarHorariosPorDoctor", () => {
    it("reemplaza horarios correctamente", async () => {
      (prismaMock.$transaction as any).mockImplementation(async (cb: any) => {
        const tx = {
          tbl_horario_doctor: {
            deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
            createMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
        };
        return cb(tx);
      });
      (prismaMock.tbl_horario_doctor.findMany as any).mockResolvedValue([
        { horario_doctor_id: 1 },
        { horario_doctor_id: 2 },
      ]);

      const result = await horarioService.reemplazarHorariosPorDoctor(1, [
        { horario_doctor_dia: "Lunes" as any, horario_doctor_inicio: "08:00", horario_doctor_fin: "12:00" },
        { horario_doctor_dia: "Martes" as any, horario_doctor_inicio: "08:00", horario_doctor_fin: "12:00" },
      ]);

      expect(result).toHaveLength(2);
    });
  });
});
