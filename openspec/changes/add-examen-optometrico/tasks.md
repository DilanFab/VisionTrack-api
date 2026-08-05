## 1. Database Model

- [x] 1.1 Add `tbl_examen_optometrico` and relations to `prisma/schema.prisma`.
- [x] 1.2 Add SQL migration for `tbl_examen_optometrico`, indexes, unique nullable `cita_id`, and foreign keys.
- [x] 1.3 Generate Prisma Client after schema changes.

## 2. API Contract and Validation

- [x] 2.1 Add Zod schemas and inferred types for optometric exam create/update/query/finalize flows.
- [x] 2.2 Define JSON section defaults and validation helpers for optional clinical sections.

## 3. Service Layer

- [x] 3.1 Implement optometric exam service list/get/create/update/finalize/delete operations.
- [x] 3.2 Validate required clinical history existence and optional appointment ownership.
- [x] 3.3 Preserve logical deletion and finalized-state rules.

## 4. HTTP Layer

- [x] 4.1 Add controller handlers with project-style responses and error statuses.
- [x] 4.2 Add routes for `/api/examenes-optometricos` and nested clinical-history listing.
- [x] 4.3 Mount new routes in `src/app.ts` with authentication and role guards.

## 5. Tests and Verification

- [x] 5.1 Add unit tests for service success paths and validation/error paths.
- [x] 5.2 Add integration tests for create/list/get/update/finalize/delete endpoints.
- [x] 5.3 Run build and test commands, then fix any failures.
