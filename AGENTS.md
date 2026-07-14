# VisionTrack API — Memoria Persistente

## Stack Técnico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Runtime | Node.js | 20 LTS |
| Lenguaje | TypeScript | ^6.0.3 |
| Framework | Express | ^5.2.1 |
| ORM | Prisma | ^7.8.0 |
| Base de datos | PostgreSQL (Supabase) | — |
| Autenticación | bcryptjs + jsonwebtoken | 3.x / 9.x |
| Uploads | Multer | ^2.2.0 |
| Seguridad | helmet + express-rate-limit | ^8.x / ^7.x |
| Validación | Zod | ^3.x |
| Testing | Jest + ts-jest | ^30.x / ^29.x |
| Mocks | jest-mock-extended | ^4.x |

## Estructura del Proyecto

```
src/
├── app.ts                          # Entry point, middlewares globales, montaje de rutas
├── config/
│   └── prisma.ts                   # Singleton de PrismaClient
├── middlewares/
│   ├── auth.ts                     # verifyToken + authorize
│   ├── upload.ts                   # Multer — uploadImagenUsuario y uploadImagenPaciente
│   ├── rateLimit.ts                # authLimiter (5/min) + generalLimiter (100/min)
│   └── errorHandler.ts             # Manejador global de errores
├── routes/                         # Archivos de rutas (Router de Express)
│   ├── authRoutes.ts
│   ├── notificacionesRoutes.ts
│   ├── usuarios/   (genero, persona, usuario, usuarioCompleto, upload)
│   ├── rolesPermisos/ (menu, rol, permiso, perfil)
│   ├── medicos/    (especialidadMedica, doctor, doctorCompleto, horarioDoctor)
│   └── citas/      (cita, estadoCita, historiaClinica, pacienteCompleto)
├── controllers/                    # Handlers HTTP delgados (solo req/res)
│   ├── authController.ts
│   ├── notificacionesController.ts
│   ├── usuarios/   (misma estructura que routes)
│   ├── rolesPermisos/
│   ├── medicos/
│   ├── citas/
│   └── movil/
├── services/                       # Lógica de negocio + queries Prisma (sin Express)
│   ├── authService.ts              # login, register, refresh
│   ├── generoService.ts
│   ├── menuService.ts
│   ├── rolService.ts
│   ├── perfilService.ts
│   ├── permisoService.ts
│   ├── personaService.ts
│   ├── usuarioService.ts
│   ├── usuarioCompletoService.ts
│   ├── especialidadMedicaService.ts
│   ├── doctorService.ts
│   ├── doctorCompletoService.ts
│   ├── horarioDoctorService.ts
│   ├── historiaClinicaService.ts
│   ├── estadoCitaService.ts
│   ├── citaService.ts
│   ├── pacienteCompletoService.ts
│   └── notificacionesService.ts
├── services/
│   ├── push.ts, email.ts          # Servicios externos (Expo Push, Resend)
│   ├── *.test.ts                  # Tests unitarios de cada service (6 archivos, 75 tests)
├── jobs/
│   └── recordatorioCitas.ts        # Cron job (cada 30 min)
├── utils/
│   ├── pagination.ts               # getPagination, paginatedResponse
│   └── filters.ts                  # buildSearchFilter, buildDateFilter, etc.
└── validations/
    └── auth.schema.ts              # Zod schemas
```

## Convenciones de Código

### Auth Middlewares (implementados Julio 2026)

Dos middlewares en `src/middlewares/auth.ts`:

- **`verifyToken`** — Extrae y valida JWT del header `Authorization: Bearer <token>`. Decodifica el payload y lo asigna a `req.usuario`. Si `AUTH_BYPASS=true` en `.env`, asigna un usuario Admin de prueba y continúa sin verificar.
- **`authorize(...rolesPermitidos)`** — Factory que retorna un middleware. Verifica que al menos uno de los roles de `req.usuario.roles` esté en `rolesPermitidos`. Si no, responde 403.

### Mapa de guards por ruta

| Ruta | Acceso | Middleware |
|------|--------|-----------|
| `GET /api/auth/*` | Público | — |
| `GET /api/generos`, `GET /api/generos/:id` | Público | — |
| `GET /api/especialidades-medicas*` | Público | — |
| `GET /api/estados-cita*` | Público | — |
| `POST /api/uploads/imagen-paciente` | Público | — |
| `POST /api/uploads/imagen` | Autenticado | `verifyToken` |
| CRUD `/api/generos` (POST/PUT/DELETE) | Admin | `verifyToken` + `authorize("Admin")` |
| CRUD `/api/especialidades-medicas` (POST/PUT/DELETE) | Admin | `verifyToken` + `authorize("Admin")` |
| CRUD `/api/estados-cita` (POST/PUT/DELETE) | Admin | `verifyToken` + `authorize("Admin")` |
| CRUD `/api/personas`, `/api/usuarios`, `/api/menus`, `/api/roles` | Admin | `verifyToken` + `authorize("Admin")` |
| CRUD `/api/permisos*`, `/api/perfiles*` | Admin | `verifyToken` + `authorize("Admin")` |
| CRUD `/api/usuarios-completos*` | Admin | `verifyToken` + `authorize("Admin")` |
| CRUD `/api/doctores-completos*` | Admin | `verifyToken` + `authorize("Admin")` |
| CRUD `/api/pacientes-completos*` | Admin | `verifyToken` + `authorize("Admin")` |
| CRUD `/api/doctores*` | Admin + Médico | `verifyToken` + `authorize("Admin", "Medico")` |
| CRUD `/api/horarios-doctor*` | Admin + Médico | `verifyToken` + `authorize("Admin", "Medico")` |
| CRUD `/api/historias-clinicas*` | Admin + Médico | `verifyToken` + `authorize("Admin", "Medico")` |
| CRUD `/api/citas*` | Admin + Médico | `verifyToken` + `authorize("Admin", "Medico")` |

### Archivos y carpetas
- Todo en español (nombres de tablas, controladores, rutas, variables).
- Prefijo `tbl_` para modelos de Prisma (ej: `tbl_usuario`, `tbl_cita`).
- Los archivos de ruta se llaman `{recurso}Routes.ts` y exportan `default`.
- Los controladores se llaman `{recurso}Controller.ts` con exports nombrados.
- Middlewares en `src/middlewares/` con exports nombrados.

### Controladores
- Cada handler es un `async (req: Request, res: Response) => {...}`.
- Usan `try/catch` inline con errorHandler global como fallback.
- Respuestas exitosas: `res.status(200).json(data)` o `res.status(201).json(data)`.
- Errores: `res.status(4xx/5xx).json({ error: "mensaje" })`.
- Conversión de IDs: `Number(req.params.id)`.
- Las queries de Prisma reutilizables se definen como constantes fuera del handler (ej: `citaInclude`, `usuarioCompletoSelect`).
- Validación de entrada con Zod schemas en `src/validations/`.

### Prisma / Base de datos
- Borrado lógico con campo `*_estado` tipo `@db.Char(1)` — valores `"A"` (activo) e `"I"` (inactivo).
- Las relaciones usan `onDelete: Cascade, onUpdate: Cascade`.
- Operaciones multi-tabla con `prisma.$transaction()`.

### Autenticación
- JWT con payload `{ usuario_id, usuario_nombre, email, roles }`.
- Access token: 15 min. Refresh token: 7 días.
- **Secret**: `JWT_SECRET` obligatorio en `.env` (sin fallback hardcodeado).
- Middlewares implementados: `verifyToken` + `authorize(...roles)` en `src/middlewares/auth.ts`.
- Variable `AUTH_BYPASS=true` en `.env` para desarrollo — desactiva toda verificación.
- IDs de rol hardcodeados: Admin=1, Medico=3, Paciente=4.
- **Refresh tokens**: stateless JWT, endpoint `POST /api/auth/refresh`.

### Seguridad (implementados Julio 2026)
- **Helmet**: headers de seguridad HTTP (X-XSS-Protection, X-Frame-Options, CSP, etc.).
- **CORS**: whitelist configurable vía `CORS_ORIGINS` en `.env` (default: `http://localhost:5173`).
- **Rate-limit**: `authLimiter` (5 req/min) en login/register, `generalLimiter` (100 req/min) global.
- **Error handler**: `src/middlewares/errorHandler.ts` — captura errores no operacionales, respuesta consistente.
- **Zod**: schemas de validación en `src/validations/` — login y register ya integrados.

### Testing (implementados Julio 2026)
- **Framework**: Jest 30 + ts-jest 29 + jest-mock-extended 4.
- **Config**: `jest.config.js` (CJS) en raíz del proyecto.
- **Tests**: 6 archivos en `src/services/*.test.ts` — 75 tests unitarios cubriendo todos los services.
- **Mock de Prisma**: `jest.mock("../config/prisma", () => ({ __esModule: true, default: require("jest-mock-extended").mockDeep() }))`. Se crea el mock **dentro** de la factory para evitar el bug de hoisting de Jest.
- **JWT_SECRET**: se define `process.env.JWT_SECRET` al inicio de cada test file que use auth.
- **Zod**: las contraseñas en tests deben tener ≥8 caracteres (validación Zod).
- **Comandos**: `npm test` (ejecuta todos), `npm run test:watch`, `npm run test:coverage`.

## Decisiones Activas (Deuda Técnica Documentada)

| # | Decisión | Impacto | Plan |
|---|----------|---------|------|
| 1 | ~~Sin middleware de auth en rutas~~ | ~~API pública~~ | ✅ Implementado verifyToken + authorize |
| 2 | ~~JWT_SECRET hardcodeado~~ | ~~Riesgo de seguridad~~ | ✅ JWT_SECRET en .env, sin fallback |
| 3 | ~~CORS abierto (`cors()`)~~ | ~~Riesgo de seguridad~~ | ✅ Whitelist configurable vía CORS_ORIGINS |
| 4 | ~~Sin capa de servicios~~ | ~~Controladores gruesos, difícil testear~~ | ✅ 16 services extraídos |
| 5 | ~~Sin validación (Zod/Joi)~~ | ~~Datos mal formados pueden llegar a BD~~ | ✅ Zod en auth (login + register) |
| 6 | ~~Sin tests~~ | ~~No hay cobertura~~ | ✅ Jest + ts-jest, 75 tests en 6 archivos |
| 7 | ~~Sin manejador global de errores~~ | ~~Código repetitivo, errores inconsistentes~~ | ✅ errorHandler.ts implementado |
| 8 | ~~Sin paginación/filtros~~ | ~~GETs traen todo sin límite~~ | ✅ paginación + filtros implementados |

## API — Resumen de Endpoints (72 totales)

### Auth — `/api/auth`
- `POST /login` — login con email+password, devuelve accessToken + refreshToken
- `POST /register` — registro paciente/doctor, devuelve accessToken + refreshToken
- `POST /refresh` — recibe refreshToken, devuelve nuevo par de tokens

### CRUD estándar (5 endpoints c/u: GET all, GET by id, POST, PUT, DELETE lógico)
- `/api/generos`
- `/api/personas`
- `/api/usuarios`
- `/api/menus`
- `/api/roles`
- `/api/permisos` (+ `PUT /rol/:id` — reemplazo masivo)
- `/api/perfiles`
- `/api/especialidades-medicas`
- `/api/doctores`
- `/api/horarios-doctor` (+ `GET /doctor/:doctorId`, `PUT /doctor/:doctorId`)
- `/api/estados-cita`
- `/api/historias-clinicas`

### Compuestos (transacciones multi-tabla)
- `/api/usuarios-completos`
- `/api/doctores-completos`
- `/api/pacientes-completos`

### Uploads
- `POST /api/uploads/imagen` — foto de usuario
- `POST /api/uploads/imagen-paciente` — foto de paciente (guarda en frontend)

### App Móvil — `/api/movil`
- `GET /disponibilidad?fecha=&doctor_id=` — slots libres (público)
- `GET /mis-citas` — citas del paciente (Paciente)
- `POST /agendar` — agendar cita (Paciente)
- `DELETE /mis-citas/:id` — cancelar cita propia (Paciente)

## BD — Modelos Principales

```
tbl_genero 1──N tbl_persona 1──1 tbl_usuario 1──N tbl_perfil N──1 tbl_rol
                                              ├──1 tbl_doctor N──1 tbl_especialidad_medica
                                              │       └──N tbl_horario_doctor
                                              └──N tbl_historia_clinica 1──N tbl_cita
tbl_menu 1──N tbl_menu (self-ref) ── N tbl_permiso N──1 tbl_rol
```

## Próximos Pasos Prioritarios

1. ✅ Middleware de autenticación JWT (`verifyToken`)
2. ✅ Middleware de autorización por rol (`authorize`)
3. ✅ Mover JWT_SECRET a variable de entorno
4. ✅ Restringir CORS a orígenes conocidos
5. ✅ Agregar helmet para headers de seguridad
6. ✅ Agregar rate-limiting en login/register
7. ✅ Implementar manejador global de errores
8. ✅ Agregar validación con Zod
9. ✅ Implementar refresh tokens (para app móvil)
10. ✅ Endpoints móviles: disponibilidad, mis citas, agendar
11. Notificaciones (email/SMS) para recordatorio de citas
12. ✅ Paginación y filtros
13. ✅ Testing con Jest (75 tests unitarios)
