// AUTH_BYPASS=true para saltar autenticación en estos tests
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

const mockCita = {
  cita_id: 1,
  horario_doctor_id: 1,
  historia_clinica_id: 1,
  cita_fecha: new Date("2026-07-15"),
  cita_motivo: "Examen general",
  estado_cita_id: 1,
  cita_notificacion_enviada: false,
  horario_doctor: {
    horario_doctor_id: 1,
    horario_doctor_dia: "Lunes",
    horario_doctor_inicio: "08:00",
    horario_doctor_fin: "09:00",
    doctor: {
      doctor_id: 1,
      especialidad_medica: { especialidad_medica_id: 1, especialidad_medica_nombre: "Optometría" },
      perfil: {
        usuario: {
          persona: {
            persona_primer_nombre: "Carlos",
            persona_primer_apellido: "Lopez",
          },
        },
      },
    },
  },
  historia_clinica: {
    historia_clinica_id: 1,
    perfil: {
      usuario: {
        persona: {
          persona_primer_nombre: "Juan",
          persona_primer_apellido: "Perez",
        },
      },
    },
  },
  estado_cita: { estado_cita_id: 1, estado_cita_nombre: "Programada" },
};

describe("Citas - Integración", () => {
  // ─── LISTAR ────────────────────────────────────────────
  describe("GET /api/citas", () => {
    it("retorna citas paginadas", async () => {
      (prismaMock.tbl_cita.findMany as any).mockResolvedValue([mockCita]);
      (prismaMock.tbl_cita.count as any).mockResolvedValue(1);

      const res = await request(app).get("/api/citas");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("pagination");
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ─── OBTENER POR ID ────────────────────────────────────
  describe("GET /api/citas/:id", () => {
    it("retorna cita por ID", async () => {
      (prismaMock.tbl_cita.findUnique as any).mockResolvedValue(mockCita);

      const res = await request(app).get("/api/citas/1");

      expect(res.status).toBe(200);
      expect(res.body.cita_id).toBe(1);
    });

    it("retorna 404 si no existe", async () => {
      (prismaMock.tbl_cita.findUnique as any).mockResolvedValue(null);

      const res = await request(app).get("/api/citas/999");

      expect(res.status).toBe(404);
    });
  });

  // ─── CREAR ────────────────────────────────────────────
  describe("POST /api/citas", () => {
    it("crea cita sin conflicto", async () => {
      (prismaMock.tbl_cita.findFirst as any).mockResolvedValue(null);
      (prismaMock.tbl_estado_cita.findFirst as any).mockResolvedValue({ estado_cita_id: 1, estado_cita_nombre: "Programada" });
      (prismaMock.tbl_cita.create as any).mockResolvedValue(mockCita);

      const res = await request(app)
        .post("/api/citas")
        .send({
          horario_doctor_id: 1,
          historia_clinica_id: 1,
          cita_fecha: "2026-07-15",
          cita_motivo: "Examen general",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("cita_id");
    });

    it("retorna error si hay conflicto de horario", async () => {
      (prismaMock.tbl_cita.findFirst as any).mockResolvedValue({ cita_id: 2 });

      const res = await request(app)
        .post("/api/citas")
        .send({
          horario_doctor_id: 1,
          historia_clinica_id: 1,
          cita_fecha: "2026-07-15",
          cita_motivo: "Examen",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("cita agendada");
    });
  });

  // ─── CANCELAR ──────────────────────────────────────────
  describe("DELETE /api/citas/:id", () => {
    it("cancela cita existente", async () => {
      (prismaMock.tbl_estado_cita.findFirst as any).mockResolvedValue({ estado_cita_id: 2, estado_cita_nombre: "Cancelada" });
      (prismaMock.tbl_cita.update as any).mockResolvedValue({ ...mockCita, estado_cita_id: 2 });

      const res = await request(app).delete("/api/citas/1");

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("cancelada");
    });
  });
});
