# VisionTrack API — Roadmap

> Sistema de gestión para clínica optométrica.
> API REST construida con Express 5 + TypeScript + Prisma + PostgreSQL (Supabase).

---

## Fase 1 — Core API ✅ LISTO

Lo fundamental para que la API funcione y sirva datos al frontend.

- [x] Proyecto TypeScript con Express 5
- [x] Prisma ORM + PostgreSQL (Supabase)
- [x] Esquema de BD completo (11 tablas, 1 enum)
- [x] 13 migraciones aplicadas
- [x] CRUD de: géneros, personas, usuarios, menús, roles, permisos, perfiles
- [x] CRUD de: especialidades médicas, doctores, horarios, estados de cita
- [x] CRUD de: historias clínicas, citas
- [x] Endpoints compuestos: usuario-completo, doctor-completo, paciente-completo
- [x] Autenticación: login y register con JWT (bcryptjs)
- [x] Upload de imágenes (Multer, 5MB, solo imágenes)
- [x] 72 endpoints funcionales
- [x] Borrado lógico consistente en todas las tablas
- [x] Validación de conflictos de horario al agendar citas

---

## Fase 2 — Seguridad ✅ LISTO

Cerrar las vulnerabilidades críticas antes de producción.

- [x] Middleware `verifyToken` — validar JWT en rutas protegidas
- [x] Middleware `authorize(...roles)` — guard por rol
- [x] Mover `JWT_SECRET` a variable de entorno
- [x] Configurar CORS con whitelist de orígenes
- [x] Agregar helmet (HTTP security headers)
- [x] Agregar express-rate-limit (especialmente en login/register)
- [x] Validación de entrada con Zod
- [x] Sanitización de archivos subidos (magic bytes validados post-upload)
- [x] Manejo global de errores (middleware errorHandler)
- [x] Obscurecer `console.error` en producción (logger condicional)

---

## Fase 3 — Calidad ✅ LISTO

Profesionalizar el código, hacerlo mantenible y testeable.

- [x] Refactor: separar capa de servicios (controllers delgados) — 16 services
- [x] Refactor: extraer includes/selects de Prisma a archivos compartidos
- [x] Setup de Jest (ts-jest) + jest-mock-extended
- [x] Tests unitarios para servicios (75 tests en 6 archivos)
- [x] Tests de integración para endpoints críticos (auth, citas) — 21 tests con supertest
- [x] Documentación de API con Swagger/OpenAPI (UI en `/api/docs`)
- [x] Script `npm run migrate:deploy` para producción
- [x] Mejorar logging (pino con logs estructurados JSON)

---

## Fase 4 — Features 🟢 BAJA

Funcionalidades nuevas para completar el negocio.

- [x] Paginación, búsqueda y filtros en endpoints GET (8 endpoints)
- [x] Recuperación de contraseña (forgot/reset password)
- [x] Refresh tokens (JWT con refresh)
- [x] Bloqueo de cuenta tras 5 intentos fallidos (campo `usuario_intentos`)
- [x] Notificaciones (email/SMS) para recordatorio de citas
- [ ] Dashboard con KPIs (citas hoy, pacientes nuevos, etc.)
- [x] Agenda del doctor (slots disponibles)
- [ ] Historial de cambios / auditoría
- [ ] Exportar reportes (PDF/Excel)

---
