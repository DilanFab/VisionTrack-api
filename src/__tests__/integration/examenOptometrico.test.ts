process.env.AUTH_BYPASS = "true";

jest.mock("node-fetch", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../../middlewares/rateLimit", () => ({
  authLimiter: (_req: any, _res: any, next: any) => next(),
  generalLimiter: (_req: any, _res: any, next: any) => next(),
}));
jest.mock("../../config/prisma", () => ({
  __esModule: true,
  default: require("jest-mock-extended").mockDeep(),
}));

import prismaMock from "../../config/prisma";
import app from "../../app";
import request from "supertest";

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
  examen_fecha: new Date("2026-08-05"),
  examen_motivo_consulta: "Control visual",
  examen_estado: "B",
  lensometria: { od: "-1.00" },
};

describe("Examenes Optometricos - Integración", () => {
  describe("GET /api/examenes-optometricos", () => {
    it("retorna examenes paginados", async () => {
      (prismaMock.tbl_examen_optometrico.findMany as any).mockResolvedValue([mockExamen]);
      (prismaMock.tbl_examen_optometrico.count as any).mockResolvedValue(1);

      const res = await request(app).get("/api/examenes-optometricos");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("pagination");
    });
  });

  describe("GET /api/historias-clinicas/:id/examenes-optometricos", () => {
    it("retorna examenes de una historia clínica", async () => {
      (prismaMock.tbl_historia_clinica.findFirst as any).mockResolvedValue(mockHistoria);
      (prismaMock.tbl_examen_optometrico.findMany as any).mockResolvedValue([mockExamen]);
      (prismaMock.tbl_examen_optometrico.count as any).mockResolvedValue(1);

      const res = await request(app).get("/api/historias-clinicas/1/examenes-optometricos");

      expect(res.status).toBe(200);
      expect(res.body.data[0].examen_optometrico_id).toBe(1);
    });
  });

  describe("POST /api/examenes-optometricos", () => {
    it("crea examen optométrico manual", async () => {
      (prismaMock.tbl_historia_clinica.findFirst as any).mockResolvedValue(mockHistoria);
      (prismaMock.tbl_examen_optometrico.create as any).mockResolvedValue(mockExamen);

      const res = await request(app)
        .post("/api/examenes-optometricos")
        .send({ historia_clinica_id: 1, examen_motivo_consulta: "Control visual" });

      expect(res.status).toBe(201);
      expect(res.body.examen_optometrico_id).toBe(1);
    });

    it("retorna 400 si cita no pertenece a historia", async () => {
      (prismaMock.tbl_historia_clinica.findFirst as any).mockResolvedValue(mockHistoria);
      (prismaMock.tbl_cita.findUnique as any).mockResolvedValue({ cita_id: 3, historia_clinica_id: 99 });

      const res = await request(app)
        .post("/api/examenes-optometricos")
        .send({ historia_clinica_id: 1, cita_id: 3 });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/examenes-optometricos/:id", () => {
    it("retorna 404 si no existe", async () => {
      (prismaMock.tbl_examen_optometrico.findUnique as any).mockResolvedValue(null);

      const res = await request(app).get("/api/examenes-optometricos/999");

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/examenes-optometricos/:id/finalizar", () => {
    it("finaliza examen", async () => {
      (prismaMock.tbl_examen_optometrico.findUnique as any).mockResolvedValue(mockExamen);
      (prismaMock.tbl_examen_optometrico.update as any).mockResolvedValue({ ...mockExamen, examen_estado: "F" });

      const res = await request(app).patch("/api/examenes-optometricos/1/finalizar");

      expect(res.status).toBe(200);
      expect(res.body.examen_estado).toBe("F");
    });
  });

  describe("DELETE /api/examenes-optometricos/:id", () => {
    it("desactiva examen", async () => {
      (prismaMock.tbl_examen_optometrico.findUnique as any).mockResolvedValue(mockExamen);
      (prismaMock.tbl_examen_optometrico.update as any).mockResolvedValue({ ...mockExamen, examen_estado: "I" });

      const res = await request(app).delete("/api/examenes-optometricos/1");

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("desactivado");
    });
  });
});
