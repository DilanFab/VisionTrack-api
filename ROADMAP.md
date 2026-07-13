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

## Fase 2 — Seguridad 🟡 PRIORIDAD

Cerrar las vulnerabilidades críticas antes de producción.

- [x] Middleware `verifyToken` — validar JWT en rutas protegidas
- [x] Middleware `authorize(...roles)` — guard por rol
- [x] Mover `JWT_SECRET` a variable de entorno
- [x] Configurar CORS con whitelist de orígenes
- [x] Agregar helmet (HTTP security headers)
- [x] Agregar express-rate-limit (especialmente en login/register)
- [x] Validación de entrada con Zod
- [ ] Sanitización de archivos subidos (tipo real, no solo extensión)
- [x] Manejo global de errores (middleware errorHandler)
- [ ] Obscurecer `console.error` en producción

---

## Fase 3 — Calidad 🟡 MEDIA

Profesionalizar el código, hacerlo mantenible y testeable.

- [ ] Refactor: separar capa de servicios (controllers delgados)
- [ ] Refactor: extraer includes/selects de Prisma a archivos compartidos
- [ ] Setup de Jest (o Vitest)
- [ ] Tests unitarios para servicios
- [ ] Tests de integración para endpoints críticos (auth, citas)
- [ ] Documentación de API con Swagger/OpenAPI
- [ ] Script `npm run migrate:deploy` para producción
- [ ] Mejorar logging (pino o winston en vez de console.error)

---

## Fase 4 — Features 🟢 BAJA

Funcionalidades nuevas para completar el negocio.

- [ ] Paginación, búsqueda y filtros en endpoints GET
- [ ] Recuperación de contraseña (forgot/reset password)
- [ ] Refresh tokens (JWT con refresh)
- [ ] Bloqueo de cuenta tras N intentos fallidos (campo `usuario_intentos`)
- [ ] Notificaciones (email/SMS) para recordatorio de citas
- [ ] Dashboard con KPIs (citas hoy, pacientes nuevos, etc.)
- [ ] Agenda del doctor (slots disponibles)
- [ ] Historial de cambios / auditoría
- [ ] Exportar reportes (PDF/Excel)

---

## Fase 5 — DevOps 🟢 BAJA

Infraestructura y despliegue.

- [ ] Dockerfile multi-stage
- [ ] docker-compose.yml (API + DB local para dev)
- [ ] CI/CD con GitHub Actions (lint → test → build → deploy)
- [ ] Scripts de deploy automatizado
- [ ] Health check endpoint mejorado (`/health`)
- [ ] Configuración HTTPS/TLS
