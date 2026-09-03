process.env.JWT_SECRET = "test-secret";

import { authorize } from "./auth";

type Req = { usuario?: { roles: string[] } };

const mockRes = () => {
  const res: any = { statusCode: 200 };
  res.status = jest.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn(() => res);
  return res;
};

describe("authorize — permisos de facturación (emitir/anular)", () => {
  // guardEscritura es authorize("Recepcionista") en facturaRoutes
  const guardEscritura = authorize("Recepcionista");

  it("permite a Recepcionista emitir/anular facturas", () => {
    const req: Req = { usuario: { roles: ["Recepcionista"] } };
    const res = mockRes();
    const next = jest.fn();
    guardEscritura(req as any, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
  });

  it("deniega a Administrador emitir/anular facturas (403)", () => {
    const req: Req = { usuario: { roles: ["Administrador"] } };
    const res = mockRes();
    const next = jest.fn();
    guardEscritura(req as any, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
  });

  it("deniega a otro rol (Médico) emitir/anular facturas (403)", () => {
    const req: Req = { usuario: { roles: ["Médico"] } };
    const res = mockRes();
    const next = jest.fn();
    guardEscritura(req as any, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
  });

  it("maneja roles con acentos y mayúsculas/minúsculas", () => {
    const req: Req = { usuario: { roles: ["RECEPCIONISTA"] } };
    const res = mockRes();
    const next = jest.fn();
    guardEscritura(req as any, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe("authorize — lectura de facturas (Admin + Recepcionista)", () => {
  // guardLectura es authorize("Administrador", "Recepcionista") en facturaRoutes
  const guardLectura = authorize("Administrador", "Recepcionista");

  it("permite a Administrador leer facturas", () => {
    const req: Req = { usuario: { roles: ["Administrador"] } };
    const res = mockRes();
    const next = jest.fn();
    guardLectura(req as any, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("permite a Recepcionista leer facturas", () => {
    const req: Req = { usuario: { roles: ["Recepcionista"] } };
    const res = mockRes();
    const next = jest.fn();
    guardLectura(req as any, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("deniega a Médico leer facturas (403)", () => {
    const req: Req = { usuario: { roles: ["Médico"] } };
    const res = mockRes();
    const next = jest.fn();
    guardLectura(req as any, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
  });

  it("responde 401 si no hay usuario autenticado", () => {
    const req: Req = {};
    const res = mockRes();
    const next = jest.fn();
    guardLectura(req as any, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });
});
