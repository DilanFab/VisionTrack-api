jest.mock("../config/prisma", () => ({
  __esModule: true,
  default: require("jest-mock-extended").mockDeep(),
}));

import prismaMock from "../config/prisma";
import * as generoService from "./generoService";
import * as rolService from "./rolService";
import * as perfilService from "./perfilService";
import * as especialidadService from "./especialidadMedicaService";
import * as estadoCitaService from "./estadoCitaService";
import * as menuService from "./menuService";
import * as permisoService from "./permisoService";
import * as personaService from "./personaService";
import * as doctorService from "./doctorService";
import * as historiaClinicaService from "./historiaClinicaService";
import * as notificacionesService from "./notificacionesService";

beforeEach(() => {
  jest.clearAllMocks();
});

function testCrud<T extends { listar: any; obtenerPorId: any; crear: any; actualizar: any; eliminar: any }>(
  serviceName: string,
  service: T,
  tableName: string,
  idField: string,
  mockData: Record<string, unknown>,
  updateData: Record<string, unknown>,
  listarArgs?: any[]
) {
  describe(serviceName, () => {
    it("listar retorna datos", async () => {
      (prismaMock as any)[tableName].findMany.mockResolvedValue([{ [idField]: 1 }]);
      (prismaMock as any)[tableName].count?.mockResolvedValue(1);
      const result = await service.listar(...(listarArgs || []));
      expect(result).toBeDefined();
    });

    it("obtenerPorId retorna registro", async () => {
      (prismaMock as any)[tableName].findUnique.mockResolvedValue({ [idField]: 1 });
      const result = await service.obtenerPorId(1);
      expect(result).not.toBeNull();
    });

    it("obtenerPorId retorna null si no existe", async () => {
      (prismaMock as any)[tableName].findUnique.mockResolvedValue(null);
      const result = await service.obtenerPorId(999);
      expect(result).toBeNull();
    });

    it("crear retorna nuevo registro", async () => {
      (prismaMock as any)[tableName].create.mockResolvedValue({ [idField]: 1, ...mockData });
      const result = await service.crear(mockData);
      expect(result).toHaveProperty(idField);
    });

    it("actualizar retorna registro actualizado", async () => {
      (prismaMock as any)[tableName].update.mockResolvedValue({ [idField]: 1, ...updateData });
      const result = await service.actualizar(1, updateData);
      expect(result).toHaveProperty(idField);
    });

    it("eliminar retorna registro desactivado", async () => {
      (prismaMock as any)[tableName].update.mockResolvedValue({ [idField]: 1 });
      const result = await service.eliminar(1);
      expect(result).toBeDefined();
    });
  });
}

testCrud("generoService", generoService, "tbl_genero", "genero_id",
  { genero_nombre: "Masculino", genero_estado: "A" },
  { genero_nombre: "Masculino", genero_estado: "I" }
);

testCrud("rolService", rolService, "tbl_rol", "rol_id",
  { rol_nombre: "Admin", rol_descripcion: "Administrador", rol_estado: "A" },
  { rol_nombre: "Admin", rol_descripcion: "Administrador", rol_estado: "I" }
);

testCrud("perfilService", perfilService, "tbl_perfil", "perfil_id",
  { usuario_id: 1, rol_id: 1, perfil_estado: "A" },
  { usuario_id: 1, rol_id: 1, perfil_estado: "I" }
);

testCrud("especialidadMedicaService", especialidadService, "tbl_especialidad_medica", "especialidad_medica_id",
  { especialidad_medica_nombre: "Optometria", especialidad_medica_descripcion: "Examenes visuales", especialidad_medica_estado: "A" },
  { especialidad_medica_nombre: "Optometria", especialidad_medica_descripcion: "Examenes visuales", especialidad_medica_estado: "I" }
);

testCrud("estadoCitaService", estadoCitaService, "tbl_estado_cita", "estado_cita_id",
  { estado_cita_nombre: "Programada", estado_cita_descripcion: "Cita programada", estado_cita_estado: "A" },
  { estado_cita_nombre: "Programada", estado_cita_descripcion: "Cita programada", estado_cita_estado: "I" }
);

testCrud("menuService", menuService, "tbl_menu", "menu_id",
  { menu_nombre: "Dashboard", menu_icono: "home", menu_referencia: "/dashboard", menu_estado: "A" },
  { menu_nombre: "Dashboard", menu_icono: "home", menu_referencia: "/dashboard", menu_estado: "I" }
);

testCrud("doctorService", doctorService, "tbl_doctor", "doctor_id",
  { especialidad_medica_id: 1, perfil_id: 1, doctor_estado: "A" },
  { especialidad_medica_id: 1, perfil_id: 1, doctor_estado: "I" },
  [{ page: "1", limit: "20" }]
);

describe("permisoService", () => {
  it("reemplazarPermisosDeRol ejecuta transaccion", async () => {
    (prismaMock.$transaction as any).mockImplementation(async (cb: any) => {
      const tx = {
        tbl_permiso: {
          deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
          createMany: jest.fn().mockResolvedValue({ count: 2 }),
          findMany: jest.fn().mockResolvedValue([{ permiso_id: 1 }, { permiso_id: 2 }]),
        },
      };
      return cb(tx);
    });

    const result = await permisoService.reemplazarPermisosDeRol(1, [1, 2, 3]);
    expect(result).toHaveLength(2);
  });
});

describe("personaService", () => {
  it("listar retorna paginacion", async () => {
    (prismaMock.tbl_persona.findMany as any).mockResolvedValue([]);
    (prismaMock.tbl_persona.count as any).mockResolvedValue(0);
    const result = await personaService.listar({ page: "1", limit: "20" });
    expect(result).toHaveProperty("pagination");
  });

  it("crear persona con fecha", async () => {
    (prismaMock.tbl_persona.create as any).mockResolvedValue({ persona_id: 1 });
    const result = await personaService.crear({
      genero_id: 1,
      persona_cedula: "1234567890",
      persona_primer_nombre: "Juan",
      persona_primer_apellido: "Perez",
      persona_fecha_nacimiento: "1990-01-01",
      persona_direccion: "Calle 123",
      persona_telefono: "0991234567",
      persona_correo: "juan@test.com",
      persona_estado: "A",
    });
    expect(result).toHaveProperty("persona_id", 1);
  });
});

describe("historiaClinicaService", () => {
  it("listar retorna paginacion", async () => {
    (prismaMock.tbl_historia_clinica.findMany as any).mockResolvedValue([]);
    (prismaMock.tbl_historia_clinica.count as any).mockResolvedValue(0);
    const result = await historiaClinicaService.listar({ page: "1", limit: "20" });
    expect(result).toHaveProperty("pagination");
  });
});

describe("notificacionesService", () => {
  it("registrarPushToken crea token nuevo", async () => {
    (prismaMock.tbl_push_token.findFirst as any).mockResolvedValue(null);
    (prismaMock.tbl_push_token.create as any).mockResolvedValue({ push_token_id: 1 });
    const result = await notificacionesService.registrarPushToken(1, "ExpoPushToken[test]");
    expect(result.push_token_id).toBe(1);
    expect(result.duplicado).toBe(false);
  });

  it("registrarPushToken detecta duplicado", async () => {
    (prismaMock.tbl_push_token.findFirst as any).mockResolvedValue({ push_token_id: 1 });
    const result = await notificacionesService.registrarPushToken(1, "ExpoPushToken[test]");
    expect(result.duplicado).toBe(true);
  });

  it("eliminarPushToken ejecuta deleteMany", async () => {
    (prismaMock.tbl_push_token.deleteMany as any).mockResolvedValue({ count: 1 });
    const result = await notificacionesService.eliminarPushToken(1, "token");
    expect(result.count).toBe(1);
  });
});
