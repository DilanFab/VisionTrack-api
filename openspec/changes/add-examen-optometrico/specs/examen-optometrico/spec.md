## Purpose

This capability allows VisionTrack to store structured optometric exam records for a patient clinical history, preserving the detailed clinical sections required by the optometry history form while supporting appointment-derived and historical/manual records.

## ADDED Requirements

### Requirement: Create optometric exam
The system SHALL allow an authorized administrator or doctor to create an optometric exam with a required clinical history reference and an optional appointment reference.

#### Scenario: Create manual exam without appointment
- **WHEN** an authorized user submits a valid exam payload with `historia_clinica_id` and no `cita_id`
- **THEN** the system creates an active optometric exam linked to that clinical history

#### Scenario: Create exam from appointment
- **WHEN** an authorized user submits a valid exam payload with `historia_clinica_id` and `cita_id`
- **THEN** the system creates an active optometric exam linked to both the clinical history and appointment

#### Scenario: Reject missing clinical history
- **WHEN** an authorized user submits an exam payload without `historia_clinica_id`
- **THEN** the system rejects the request with a validation error

#### Scenario: Reject appointment from another clinical history
- **WHEN** an authorized user submits `cita_id` for an appointment that belongs to a different clinical history than `historia_clinica_id`
- **THEN** the system rejects the request with a client error

### Requirement: Store optometric clinical sections
The system SHALL store the optometric exam's administrative, anamnesis, antecedent, lensometry, visual acuity, biomicroscopy, pupillary reflex, ophthalmoscopy, motor exam, keratometry, refraction, diagnosis, treatment, examiner, and consent data.

#### Scenario: Store detailed exam sections
- **WHEN** an authorized user submits valid structured section data for an optometric exam
- **THEN** the system persists those section values and returns them in the exam response

#### Scenario: Use defaults for omitted optional sections
- **WHEN** an authorized user submits only required exam fields and selected optional text fields
- **THEN** the system stores omitted optional section objects as empty structured values or null values according to the API contract

### Requirement: List and retrieve optometric exams
The system SHALL allow authorized users to list optometric exams with pagination and filters, retrieve one exam by id, and list exams belonging to one clinical history.

#### Scenario: List paginated exams
- **WHEN** an authorized user requests the optometric exam collection with pagination parameters
- **THEN** the system returns a paginated response containing exam records and pagination metadata

#### Scenario: Filter exams by clinical history
- **WHEN** an authorized user requests exams for a specific `historia_clinica_id`
- **THEN** the system returns only exams linked to that clinical history

#### Scenario: Retrieve non-existent exam
- **WHEN** an authorized user requests an optometric exam id that does not exist
- **THEN** the system returns a not found error

### Requirement: Update and finalize optometric exam
The system SHALL allow authorized users to update active optometric exams and mark an exam as finalized without deleting its data.

#### Scenario: Update active exam
- **WHEN** an authorized user submits valid updates for an active optometric exam
- **THEN** the system persists the changes and returns the updated exam

#### Scenario: Finalize exam
- **WHEN** an authorized user finalizes an active optometric exam
- **THEN** the system marks the exam as finalized and preserves all stored clinical data

### Requirement: Logical delete optometric exam
The system SHALL logically delete optometric exams by changing their state instead of physically removing records.

#### Scenario: Delete exam logically
- **WHEN** an authorized user deletes an existing optometric exam
- **THEN** the system marks the exam inactive and returns confirmation without physically deleting the record

### Requirement: Protect optometric exam endpoints
The system SHALL require authentication and administrator or doctor authorization for optometric exam management endpoints.

#### Scenario: Reject unauthenticated request
- **WHEN** a request without a valid token accesses an optometric exam management endpoint
- **THEN** the system rejects the request as unauthenticated

#### Scenario: Reject unauthorized role
- **WHEN** an authenticated user without administrator or doctor role accesses an optometric exam management endpoint
- **THEN** the system rejects the request as forbidden
