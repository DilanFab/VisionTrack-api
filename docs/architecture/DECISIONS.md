# Architecture Decision Records (ADRs)

> Registro de decisiones arquitectónicas del proyecto VisionTrack API.

---

## ADR-001: Express 5 como framework web

**Contexto**: Necesitábamos un framework para construir la API REST. Las opciones考虑adas fueron Express 5, NestJS y Fastify.

**Decisión**: elegimos Express 5 por:
- Simplicidad y curva de aprendizaje baja — equipo pequeño, entrega rápida.
- Ecosistema maduro y amplia comunidad.
- Express 5 ya maneja async errors automáticamente, eliminando la necesidad de `express-async-errors`.
- Suficiente para el alcance del proyecto.

**Consecuencias**:
- No tenemos inyección de dependencias ni decoradores (a diferencia de NestJS). La organización del código recae en convenciones manuales.
- Si el proyecto escala, migrar a NestJS sería una opción, pero no prioritaria.

---

## ADR-002: Prisma como ORM

**Contexto**: Necesitábamos un ORM para interactuar con PostgreSQL. Opciones: Prisma, TypeORM, Sequelize, SQL sin ORM.

**Decisión**: elegimos Prisma por:
- Type safety nativo — el cliente generado tipa todas las queries.
- Migraciones automáticas y declarativas.
- DX superior (autocompletado, schema como fuente de verdad).
- Soporte nativo para PostgreSQL y Supabase.

**Consecuencias**:
- Dependencia del CLI de Prisma para migraciones.
- El schema de Prisma es la fuente de verdad única de la BD.
- Las queries complejas (reportes, agregaciones) pueden requerir SQL raw.

---

## ADR-003: Supabase como proveedor de PostgreSQL

**Contexto**: Necesitábamos una base de datos PostgreSQL hosteada, sin operaciones de infraestructura.

**Decisión**: elegimos Supabase por:
- Tier gratuito generoso (500 MB, conexiones vía pooler).
- Pooler integrado (PgBouncer) — la conexión desde serverless/entornos remotos es estable.
- Proyecto en etapa temprana, evitar configurar servidor PostgreSQL manualmente.

**Consecuencias**:
- La URL de conexión apunta al pooler (`pooler.supabase.com`), no directo a la DB.
- Dependencia externa del servicio Supabase — considerar migración a RDS/Aurora si el proyecto escala.

---

## ADR-004: Patrón controller-solo (sin capa de servicios)

**Contexto**: Al iniciar el proyecto, optimizamos para velocidad de desarrollo. Decidimos no crear una capa de servicios separada.

**Decisión**: la lógica de negocio vive directamente en los controladores. No hay archivos `services/` ni `repositories/`.

**Consecuencias**:
- Controladores gruesos y difíciles de testear de forma aislada.
- Código duplicado entre controladores (ej: lógica de creación de persona+usuario aparece en auth, usuarioCompleto, doctorCompleto, pacienteCompleto).
- **Deuda técnica aceptada**: se planea refactorizar a una capa de servicios (Fase 3 del roadmap).

---

## ADR-005: Borrado lógico con campo CHAR(1)

**Contexto**: Necesitábamos un mecanismo de borrado que permitiera recuperación de datos y mantuviera integridad referencial.

**Decisión**: cada tabla tiene un campo `*_estado` de tipo `@db.Char(1)` con valores `"A"` (activo) e `"I"` (inactivo). Las queries siempre filtran por `estado: "A"` (excepto admins).

**Consecuencias**:
- Consistente y simple — mismo patrón en las 11 tablas.
- No hay `deleted_at` timestamp, por lo que no sabemos cuándo se desactivó un registro (mejora posible).
- Las relaciones con `onDelete: Cascade` siguen funcionando en cascada sobre borrados físicos, pero el borrado lógico es manual.

---

## ADR-006: Multer para subida de archivos

**Contexto**: Necesitábamos permitir subida de fotos de perfil de usuarios y pacientes.

**Decisión**: usamos Multer con almacenamiento en disco local (`uploads/`). Límite de 5 MB, filtro solo imágenes por MIME type.

**Consecuencias**:
- No depende de servicios externos (S3, Cloudinary).
- Los archivos se sirven estáticamente vía `express.static`.
- Sin balanceo de carga ni redundancia — si escalamos a múltiples servidores, los uploads locales no funcionarán. Migrar a S3 sería necesario.
- Sin validación de contenido real (solo MIME type) — riesgo de archivos maliciosos.

---

## ADR-007: JWT sin refresh token

**Contexto**: Para la autenticación, decidimos usar JWT con un solo token de acceso.

**Decisión**: el token expira en 24 horas. No hay refresh token. Si el token expira, el usuario debe volver a hacer login.

**Consecuencias**:
- Simplicidad en el frontend (un solo token, sin lógica de refresh).
- Usuarios con sesiones largas tendrán que autenticarse diario.
- Si el token se compromete, es válido por 24h (no hay revocación).
- **Pendiente**: implementar refresh tokens (Fase 4 del roadmap).

---

## ADR-008: Nomenclatura en español en toda la pila

**Contexto**: El proyecto es para una clínica optométrica en Latinoamérica. El equipo y los stakeholders son hispanohablantes.

**Decisión**: usamos español para:
- Nombres de tablas (`tbl_persona`, `tbl_historia_clinica`)
- Nombres de archivos (`usuarioController.ts`, `citaRoutes.ts`)
- Mensajes de error y respuesta de la API
- Comentarios en código

**Consecuencias**:
- Alineación directa con el dominio del negocio y los stakeholders.
- Dificultad para incorporar desarrolladores que no hablen español (no es un problema actual).
- Mezcla con palabras clave de TypeScript/Prisma que están en inglés (inevitable).
