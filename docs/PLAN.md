# VoterRule - Implementation Plan

## 1. Executive Mission
Build an end-to-end, production-grade independent electoral-roll verification and inclusion-assistance portal adhering to constitutional neutrality, statutory accuracy (RPA 1950/1951, Registration of Electors Rules 1960), the Digital Personal Data Protection (DPDP) Act 2023 / Rules 2025, and WCAG 2.2 AA accessibility standards.

## 2. Core Architecture & Monorepo Structure
- **apps/api**: Fastify + TypeScript REST API (`/api/v1`), Zod validation, OpenAPI (`/api/docs`), uniform envelope `{ data, error, meta }`, central policy engine `can(actor, action, resource)`, append-only hash-chained audit logging, field-level envelope encryption (AES-256-GCM), blind index lookups (HMAC-SHA256), rate limiting, idempotency handling, background job runner.
- **apps/web**: Citizen application (React 18 + Vite + Tailwind CSS + accessible primitives). Landing, Auth, Dashboard, Voter Check, Missing-Name Wizard with Application Preparation Sheet (PDF), Corrections, Own-Duplicate Self-Check, Deceased Reporting, Case Tracking, Contact Check-in, Assisted Support, Settings, and stateless `/eligibility-check`.
- **apps/admin**: Separate Reviewer & Administrator portal (React 18 + Vite + Tailwind CSS, separate origin). Aggregate overview, Case queue, Document review, Duplicate candidates review (4-eyes sign-off), Deceased reports review, Guidance versioning, Staff RBAC, Audit hash-chain verification, Analytics with k-anonymity (k ≥ 10, district level only).
- **packages/shared**: Domain schemas (Zod), Enums, State Machines (Official-Process stages 1–8 vs Portal Workflow statuses), Crockford base32 public IDs, Role-Permission matrix.
- **packages/guidance**: Configurable, versioned rules engine (Forms 6, 6A, 6B, 7, 8; state revision schedules; document checklists; decision tree; helpline directory).
- **packages/ui**: Design system with original 24-spoke Chakra mark and Setu arc, Tiranga color tokens, and 5 accessible SVG/CSS motion components (Civic Flow, Chakra Progress Ring, Verification Path, Civic Pulse, Smart Loading).
- **packages/i18n**: Full bilingual support (English + Hindi), ICU formatting, RTL-ready logical styles, translation registry.

## 3. Implementation Phases
1. **Phase 1: Foundations**: Monorepo scaffolding, Shared schemas, Guidance engine, Database & Encryption layers, Audit log chain, Auth & RBAC policy.
2. **Phase 2: UI & Design System**: Packages/UI design system tokens, SVG brand assets, Tiranga animation system with Lite mode/reduced-motion, i18n dictionary.
3. **Phase 3: Citizen Workflows (apps/web)**: Landing, Auth, Dashboard, Voter check, Missing-name wizard with PDF prep sheet, Corrections, Deceased report, Tracking, Settings.
4. **Phase 4: Admin Workflows (apps/admin)**: Secure back-office queue, Document review, Duplicate review (rule-based matching, no accusatory terms), Guidance editor, Audit chain viewer.
5. **Phase 5: Security, Testing & Documentation**: Canary PII test, Route policy test, State machine tests, Duplicate scoring tests, E2E tests, documentation deliverables.

## 4. Missing Credentials & External Dependencies
- **ECI Official API / Portal Access**: No authorized API credentials or integration exists; `GuidedManualProvider` is active by default. Official roll access is strictly disabled (`OFFICIAL_ROLL_ACCESS_ENABLED=false`).
- **SMS Gateway (TRAI DLT)**: Registered Principal Entity ID and DLT-approved template IDs are required for Indian SMS dispatch. In local/demo mode, SMS is simulated and logged to the safe mock console.
- **Cloud KMS & Object Storage (S3)**: In local/demo mode, file-based envelope encryption and local private storage adapters are used. AWS KMS / HashiCorp Vault and S3/MinIO are configurable via `.env`.
- **Antivirus (ClamAV)**: ClamAV daemon is optional in local development (mock scanner active; rejects simulated malware signatures); production requires live ClamAV container.
- **Legal Counsel Review**: Pending sign-off on third-party report retention under DPDP 2025 and national symbol compliance under the Flag Code of India / Emblems and Names Act.
