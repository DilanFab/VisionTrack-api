## Context

The current API uses Express routes, thin controllers, service modules, Zod validation for auth inputs, Prisma 7 with PostgreSQL, and logical deletion through `*_estado` fields. `tbl_historia_clinica` is only a clinical-history header, and `tbl_cita` stores appointment scheduling plus `cita_motivo`; neither stores the optometric exam sections from the PDF.

## Goals / Non-Goals

**Goals:**
- Add a dedicated optometric exam model linked to `tbl_historia_clinica`.
- Keep `historia_clinica_id` required and `cita_id` nullable.
- Validate that an optional appointment belongs to the same clinical history.
- Follow existing Spanish naming conventions and route/controller/service layering.
- Keep the first implementation practical by storing repeated clinical sections as JSON.

**Non-Goals:**
- Generate or fill the PDF in this initial change.
- Implement patient-facing access to exam results.
- Normalize every optometric subsection into separate tables.
- Add a CIE10 catalog table in this initial change.

## Decisions

1. **Create `tbl_examen_optometrico` instead of expanding `tbl_historia_clinica`.**
   - Rationale: a patient can have multiple exams over time, while `tbl_historia_clinica` is the long-lived clinical-history header.
   - Alternative considered: add exam fields to `tbl_historia_clinica`; rejected because it would only support one mutable exam-like record per patient.

2. **Use required `historia_clinica_id` and optional `cita_id`.**
   - Rationale: supports appointment-derived exams and manual historical records.
   - Alternative considered: require `cita_id`; rejected because migrated/manual clinical history records may not have a matching appointment.

3. **Use a hybrid schema: relational columns for anchors and high-value searchable data, JSON fields for detailed sections.**
   - Relational columns: ids, date/time, consultorio/llave, core notes, diagnosis, CIE10, treatment, examiner, consent, state.
   - JSON fields: lensometry, visual acuity, biomicroscopy, pupillary reflexes, ophthalmoscopy, motor exam, keratometry, refraction.
   - Rationale: the PDF has many OD/OI/AO repeated grids; JSON preserves structure without creating excessive tables prematurely.
   - Alternative considered: fully normalized subsection tables; rejected for initial scope due implementation and migration complexity.

4. **Use `examen_estado` with values `B`, `F`, and `I`.**
   - `B`: borrador/activo editable.
   - `F`: finalizado.
   - `I`: inactivo/logically deleted.
   - Rationale: existing project uses `*_estado` char fields; finalization needs a non-deleted terminal state.
   - Alternative considered: Boolean finalized flag; rejected because a single state field matches repo conventions better.

5. **Authorize both `Medico` and `Médico` strings on the new routes.**
   - Rationale: existing route guards use `Medico` in several places, while seed/auth use `Médico`; accepting both prevents the new module from inheriting that mismatch.
   - Alternative considered: fixing all routes globally in this change; rejected as broader auth cleanup outside this feature.

## Risks / Trade-offs

- JSON fields reduce queryability for detailed section data → Keep high-value filters in normal columns and revisit normalization after real reporting needs appear.
- `cita_id` optional can permit duplicate exams for one appointment → Add unique constraint on nullable `cita_id`; PostgreSQL allows multiple nulls while preventing duplicate non-null appointments.
- Role spelling mismatch can cause access surprises elsewhere → New routes accept both spellings; global cleanup should be a separate change.
- Prisma migration may require DATABASE_URL for full `migrate dev` flow → Keep migration SQL explicit and validate schema/build locally.

## Migration Plan

1. Add Prisma model and relations.
2. Add SQL migration creating `tbl_examen_optometrico`, indexes, and foreign keys.
3. Generate Prisma Client.
4. Add validation, service, controller, routes, and route mount.
5. Add unit/integration tests and run build/tests.

Rollback: drop `tbl_examen_optometrico` and remove the route/service/controller/validation files if the feature must be reverted before release.
