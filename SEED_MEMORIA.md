# Memoria Persistente — Seed de Base de Datos (Julio 2026)

## Objetivo
Poblar la BD Supabase con datos catálogo (géneros, roles, estados de cita, menús,
permisos) para que el sidebar dinámico del frontend funcione desde arranque.

---

## Por qué se hizo de este modo

### 1. SQL crudo fallaba (seed.sql)
- `psql` NO está instalado localmente — no se puede ejecutar `.sql` desde terminal
- Supabase SQL Editor: cada ejecución fallaba por FK violations y rollback transaccional
- `tbl_permiso` no tenía constraint UNIQUE en (rol_id, menu_id) → upserts imposibles

### 2. Decisión: TypeScript + Prisma Client (no SQL)
- `ts-node` ya estaba en devDependencies → sin instalación extra
- Prisma Client resuelve IDs automáticamente (no hardcodear 1/2/3/4)
- `$transaction` + `upsert` = idempotente y atómico

### 3. Decisión: Option A (migración UNIQUE) sobre Option B (deleteMany)
- Agregar `@@unique([rol_id, menu_id])` vía migración → upserts limpios
- Más robusto que delete+insert (evita races y duplicados silenciosos)

---

## Complicaciones encontradas y cómo se resolvieron

| # | Complicación | Causa | Solución |
|---|--------------|-------|----------|
| 1 | `prisma migrate dev` falla: "non-interactive environment" | terminal no TTY | Crear migración manual (carpeta + migration.sql) y aplicar con `prisma migrate deploy` |
| 2 | `"No seed command configured"` | Prisma 7 lee config desde `prisma.config.ts`, no `package.json` | Agregar `migrations.seed` a `prisma.config.ts` |
| 3 | `PrismaClient` error: "constructed with non-empty options" | Prisma 7 requiere `@prisma/adapter-pg` explícito | Inicializar `PrismaPg` + `new PrismaClient({ adapter })` |
| 4 | `rol_id_menu_id` no existe en tipo | Prisma Client no regenerado tras schema change | Ejecutar `npx prisma generate` antes del seed |
| 5 | Transaction timeout 5000ms | 19 upserts dentro de $transaction exceden default | Aumentar timeout: `$transaction(fn, { timeout: 60000 })` |
| 6 | Roles con IDs 17-20 (no 1-4) | Auto-increment conservó IDs de intentos previos | Corregir `authService.ts:141`: lookup por nombre en vez de hardcoded 3/4 |

---

## Archivos modificados/creados

| Archivo | Acción | Notas |
|---------|--------|-------|
| `prisma/schema.prisma` | Modificar | `@@unique([rol_id, menu_id])` en `tbl_permiso` |
| `prisma/migrations/20260715120000_unique_permiso_rol_menu/migration.sql` | Crear | `CREATE UNIQUE INDEX ... ON tbl_permiso(rol_id, menu_id)` |
| `prisma/seed.ts` | Crear | Script TS idempotente con Prisma Client |
| `prisma.config.ts` | Modificar | `migrations.seed = "npx ts-node prisma/seed.ts"` |
| `package.json` | Modificar | `db:seed: "prisma db seed"` + sección `prisma.seed` (obsoleta en v7) |
| `src/services/authService.ts` | Modificar | Línea 141: lookup rol por nombre, no hardcoded ID |

## Eliminado
- `prisma/seed.sql` — reemplazado por `seed.ts` (puedes eliminarlo del repo si aún existe)

---

## Comandos para reproducir

```bash
# 1. Aplicar migración (constraint UNIQUE)
npx prisma migrate deploy

# 2. Regenerar Prisma Client (tras cambios en schema)
npx prisma generate

# 3. Ejecutar seed (idempotente)
npx prisma db seed
# o: npm run db:seed
```

---

## Estado actual de la BD (post-seed)

- 3 géneros: Masculino, Femenino, Otro
- 4 roles: Administrador (17), Recepcionista (18), Médico (19), Paciente (20)
- 4 estados de cita: Programada, Confirmada, Cancelada, Completada
- 19 menús: 6 raíz + 13 hoja
- 19 permisos: Administrador → todos los menús

⚠️ IDs de rol NO son 1-4 (auto-increment conservó IDs de intentos previos).
Cualquier código que hardcode IDs de rol debe usar lookup por `rol_nombre`.

---

## Próximos pasos pendientes

1. Borrar `localStorage` del frontend (claves `token`, `user`)
2. Iniciar backend (`npm run dev` en VisionTrack-api)
3. Iniciar frontend (`npm run dev` en VisionTrack-front)
4. Verificar que el sidebar cargue los 19 menús como Administrador
5. Crear usuario Admin real desde el panel de Administradores
6. Cambiar `AUTH_BYPASS=false` en `.env`
7. Probar login con usuario Admin real
8. Eliminar `prisma/seed.sql` del repositorio si ya no se usa

---

## Lecciones aprendidas

- Prisma 7 cambia el modelo de config: `prisma.config.ts` > `package.json` para seed
- `prisma migrate dev` requiere TTY interactivo → usar `migrate deploy` en CI/scripts
- Prisma 7 con adaptador PG requiere inicialización explícita del adapter
- IDs auto-increment NO se reinician → nunca hardcodear IDs, siempre lookup por campo único
- Default timeout de `$transaction` es 5s → aumentar para seeds con muchos upserts
