## Why

VisionTrack API currently stores only the basic clinical history header and appointment reason, but the optometry exam PDF requires structured capture of clinical exam results. This change adds the backend capability to register, retrieve, update, finalize, and logically delete optometric exams linked to a patient's clinical history.

## What Changes

- Add a new optometric exam resource associated with `historia_clinica_id` as required data.
- Allow `cita_id` to be optional so exams can be created from appointments or as historical/manual records.
- Store core clinical fields as typed columns and detailed PDF sections as structured JSON sections.
- Add protected REST endpoints for administrators and doctors to manage optometric exams.
- Add Zod validation and tests for the new service/API behavior.
- Keep patient-facing read access out of initial scope unless implemented later.

## Capabilities

### New Capabilities
- `examen-optometrico`: Manage structured optometric exam records linked to clinical histories and optionally to appointments.

### Modified Capabilities

## Impact

- Prisma schema and migrations: new `tbl_examen_optometrico` model/table and relations.
- API surface: new `/api/examenes-optometricos` routes and nested clinical-history listing route.
- Backend layers: new validation, service, controller, route, tests, and `src/app.ts` route mounting.
- Authorization: new endpoints protected for `Administrador` and medical role access.
