# Matdata Setu API Specification (v1)

**Product**: Matdata Setu (मतदाता सेतु)  
**Base URL**: `http://localhost:4000/api/v1`  
**OpenAPI Swagger UI**: `http://localhost:4000/api/docs`  
**Health Check**: `http://localhost:4000/health` and `http://localhost:4000/api/v1/health`

---

## 1. Principles & Conventions

- **RESTful Resource URLs**: Standard lowercase resources (`/api/v1/cases`, `/api/v1/auth`, etc.)
- **Uniform Envelope**: All JSON responses conform to the standard structure:
  ```json
  {
    "data": { ... },
    "error": null,
    "meta": {
      "requestId": "req-xyz789",
      "timestamp": "2026-10-31T12:00:00.000Z"
    }
  }
  ```
- **Idempotency**: All mutation endpoints (`POST /cases`, `POST /cases/:ref/documents`, submit actions) require an `Idempotency-Key` header. Repeated submissions return the cached original response without creating duplicate records.
- **Central Policy Authorization**: Every route is guarded by a central policy check (`can(actor, action, resource)`). Unmapped routes fail closed (`403 Forbidden` with code `POLICY_DENIED`).
- **Audit & Canary Logging**: Structured logs redact all sensitive PII (EPIC numbers, names, phone numbers, email addresses, auth tokens). All critical operations generate append-only, SHA-256 hash-chained audit events.

---

## 2. Authentication & Session Headers

- `X-User-ID`: Public UUID or Crockford base32 identifier of the authenticated user.
- `X-Actor-Role`: User role (`CITIZEN`, `CASE_REVIEWER`, `DOCUMENT_REVIEWER`, `DUPLICATE_MATCH_REVIEWER`, `ANALYTICS_VIEWER`, `READ_ONLY_AUDITOR`, `PLATFORM_ADMIN`, `ASSISTED_SUPPORT_AGENT`).
- `Idempotency-Key`: UUID v4 or opaque unique key for idempotency protection.

---

## 3. Core Route Modules

### 3.1 Authentication (`/api/v1/auth/*`)
- `POST /register`: Register an 18+ citizen account (email/phone + Argon2id password hash).
- `POST /login`: Authenticate and obtain session token (Argon2id verification).
- `POST /logout`: Invalidate session and revoke tokens.
- `POST /verify-age`: Explicit DPDP-compliant adult certification (18+ only).

### 3.2 Electoral Status Checks (`/api/v1/status-checks/*`)
- `POST /lookup`: Run guided voter lookup using authorized adapter or synthetic demo generator.
- `POST /record`: Record a user-reported search outcome (`CONFIRMED_PRESENT_IN_OFFICIAL_RESULT`, `NOT_FOUND_IN_CHECKED_SEARCH`, `DETAILS_APPEAR_INCONSISTENT`, `SEARCH_COULD_NOT_BE_COMPLETED`, `NEEDS_FURTHER_VERIFICATION`).
- `GET /history`: Fetch citizen's lookup history with provenance chips and timestamps.

### 3.3 Inclusion & Case Assistance (`/api/v1/cases/*`)
- `POST /`: Initialize a new case (generates `MS-2026-XXXXXXXX` public reference). Requires `Idempotency-Key`.
- `GET /`: List cases owned by current citizen.
- `GET /:ref`: Retrieve full case details including two-system status (official process stages 1–8 vs portal workflow status 1–12).
- `POST /:ref/report-submission`: Citizen records official submission with optional acknowledgement number and evidence.
- `POST /:ref/documents`: Upload supporting identification document (scanned via ClamAV adapter, private S3 bucket).
- `GET /:ref/preparation-sheet`: Generate printable PDF preparation sheet mapping citizen inputs to official statutory forms.

### 3.4 Duplicate Self-Check & Intake (`/api/v1/duplicates/*`)
- `POST /self-check`: Evaluate potential duplicate registrations using rule-based scoring (Jaro-Winkler, phonetic matching, address overlap).
- `GET /candidates` *(Reviewer only)*: Review duplicate candidates with masked PII and reason codes.
- `POST /candidates/:id/review` *(Reviewer only)*: Record reviewer determination (false positive, escalate, 4-eyes confirmation).

### 3.5 Deceased Person Reports (`/api/v1/deceased-reports/*`)
- `POST /`: Submit authenticated report with safeguards (rate limit: max 3 reports per 30 days, anti-weaponization).
- `GET /` *(Reviewer only)*: Review queue for deceased reports.
- `POST /:ref/review` *(Reviewer only)*: Reviewer marks outcome (`UNVERIFIED`, `REFERRED_VIA_OFFICIAL_CHANNEL`). Never deletes names automatically.

### 3.6 Periodic Contact Check-In (`/api/v1/checkins/*`)
- `GET /status`: View check-in cycle and channel preferences.
- `POST /respond`: Confirm contact info is current and request reminders. Non-response has zero adverse impact.

### 3.7 Guidance Engine (`/api/v1/guidance/*`)
- `GET /form-chooser`: Dynamic decision tree for statutory Forms 6, 6A, 6B, 7, and 8.
- `GET /schedules`: Verified state-specific Special Intensive Revision (SIR) dates.
- `GET /items`: Versioned guidance repository with provenance and verification dates.

### 3.8 Administration & Audit (`/api/v1/admin/*`)
- `GET /overview`: KPI summary and integration health.
- `GET /audit-events`: Inspect append-only hash-chained audit log with tamper detection verification.
- `GET /analytics`: District-level aggregated metrics suppressed where cell count $k < 10$.
- `POST /bootstrap`: Single-use, time-limited 15-minute token bootstrap for first platform administrator.

### 3.9 DPDP Data Principal Rights (`/api/v1/dpdp/*`)
- `GET /export`: Download all personal data stored in portable JSON format.
- `POST /erasure`: Request account closure and erasure (honoring legal retention of active cases).
- `GET /grievance`: Retrieve official Data Protection Grievance Officer contact details.
