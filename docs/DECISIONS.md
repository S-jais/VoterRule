# VoterRule - Architecture Decisions & Living Record

## Architecture & Product Decisions

### 1. Product Name & Civic Identity
- **Working Name**: "VoterRule" (VoterRule).
- **Sanity Check**: Evaluated against official Election Commission of India (ECI) services:
  - Official services: "Voters' Service Portal" (voters.eci.gov.in), "Voter Helpline App" (VHA), "ECINET", "cVIGIL", "Saksham ECI".
  - Findings: "VoterRule" has no naming collision with any ECI official portal. The name accurately reflects its civic bridge (Setu) role connecting citizens with official procedures.
  - Fallback name "JanMat Saathi" reserved if future trademark or statutory review dictates.
- **Civic Neutrality & Non-Affiliation**: The platform strictly uses an original 24-spoke geometric Chakra mark and abstract bridge arc. No State Emblem of India (Lion Capital of Ashoka) or national flag reproduction is used. Persistent disclaimer rendered across all viewports.

### 2. Dual Database & Storage Strategy (Demo vs Production)
- **Constraint**: Local development host has no Docker or PostgreSQL pre-installed.
- **Decision**: Architect a clean storage and database interface (`DatabaseAdapter`).
  - In production / containerized environments: PostgreSQL with connection pooling, migrations, and `pg-boss` queue runner.
  - In local dev and demo mode (`APP_MODE=demo`): Fully functional embedded SQLite engine (`better-sqlite3` or pure SQL file driver) matching identical schema constraints, foreign keys, and indexes. This ensures tests, seeds, and local instances run out of the box without external daemon requirements.
- **Object Storage**: S3-compatible private bucket interface with an embedded local filesystem adapter for dev/demo.

### 3. Cryptography & Field-Level Envelope Encryption
- **Decision**: No custom cryptography. Use standard Node.js `crypto` primitives:
  - Symmetric Field Encryption: AES-256-GCM with authenticated tags and random 96-bit IVs.
  - Data Wrapping: Key Encryption Key (KEK) wrapped master key abstraction.
  - Searchable Equality: Blind indexing via HMAC-SHA-256 with a dedicated server-side pepper secret distinct from KMS keys.
  - Duplicate Candidate Blocking: Keyed HMAC-SHA-256 matching tokens with algorithm versioning. Never treated as anonymization.
  - Password Hashing: Argon2id (or Scrypt fallback via standard Node `crypto.scrypt`) with per-user salt and memory hardening.

### 4. DPDP Act 2023 / Rules 2025 Compliance & Minor Handling
- **Decision**: Processing of children's data under Section 9 of the DPDP Act carries strict verification and parental consent mandates.
- **Rule**: VoterRule accounts are strictly restricted to adults (18+).
- **Stateless Minor Guidance**: Prospective electors (17+ eligible for advance submission under the 4 qualifying dates: Jan 1, Apr 1, Jul 1, Oct 1) receive a completely stateless, unauthenticated, zero-data-stored guidance view at `/eligibility-check`. Documented in `docs/LEGAL_REVIEW.md`.

### 5. Truth-State Separation
- **Decision**: Completely decouple the internal portal assistance lifecycle (`PortalCaseStatus`) from real-world official election authority status (`OfficialProcessStage`).
- **Guard**: Stages 6–8 (`OFFICIAL_SUBMISSION_CONFIRMED`, `OFFICIAL_DECISION_RECEIVED`, `ROLL_INCLUSION_INDEPENDENTLY_CONFIRMED`) can strictly never be set by citizen input or automated rules. Only an authorized reviewer with attached documentary evidence or an authenticated integration event can update these.

### 6. Authentication Architecture & Absolute Aadhaar Prohibition
- **Legal & Constitutional Barrier**: Under the Supreme Court of India's Constitution Bench ruling in *Justice K.S. Puttaswamy (Retd.) v. Union of India (2018)* and Section 29 of the Aadhaar Act, 2016, private civic portals are strictly prohibited by law from collecting, storing, or using Aadhaar numbers for authentication.
- **Statutory Identifier**: For electoral roll verification and case tracking, the statutory identifier is the **EPIC (Elector's Photo Identity Card / Voter ID)** number (e.g. `ABC1234567`), never Aadhaar. Voluntary Form 6B Aadhaar intimation belongs strictly on official ECI portals.
- **Implemented Authentication Channels**:
  1. **Email + Hardened Password**: Standard citizen authentication.
  2. **Mobile Number (+91) + SMS OTP**: Direct citizen login (demo OTP: `123456`) with blind indexing.
  3. **Optional EPIC (Voter ID) Linking**: Allows electors to link their 10-character Voter ID for case and roll tracking.
  4. **Active Aadhaar Guard**: Client and server validation actively intercepts 12-digit numbers and displays an educational notice explaining the legal safeguards under the Aadhaar Act and DPDP Act.

### 7. Design System Harmonization Across All Citizen Pages
- **Reference Specification**: Exact styling tokens, typography pairings (`Bricolage Grotesque` display + `Figtree` body + `Noto Sans Devanagari`), warm-white palette (`--bg: #FFFBF5`, `--ink: #0B1030`, `--surface: #FFFFFF`, `--surface-2: #F8F2E6`), 4px tricolor gradient rules (`--tri`), segmented language switchers (`.seg`), pulse ripple toggles (`.lite`), and Ashoka Chakra progress rings applied across all citizen portal pages.
- **Strict Layout Preservation**: All layouts, routing structures, statutory steps, forms, and workflows were preserved without mutation while applying tokenized CSS variables, typography classes, and button/badge/card design system variants.
- **Login / Registration with Optional Identifier**: Auth forms allow both Email + Password and Phone (+91) + OTP, and prominently expose an optional Voter ID (EPIC) / Masked Reference field. 12-digit numbers actively trigger a legal guidance notice under the Aadhaar Act and DPDP Act.

---

## Living Task List

- [x] Step 0: Inspect repo, verify runtimes, initialize git, create PLAN.md and DECISIONS.md.
- [x] Phase 1: Shared Packages & Core API
  - [x] `packages/shared`: Enums, schemas, state machine tables, base32 Crockford IDs, role permissions.
  - [x] `packages/guidance`: Versioned rules engine, JSON/YAML seeds (Forms 6/6A/6B/7/8, schedules, checklists, helpline).
  - [x] `packages/i18n`: Bilingual dictionaries (English, Hindi), ICU formatting, glossary.
  - [x] `apps/api`: Fastify server, database schema & migrations, envelope encryption, blind indexing, central policy guard `can()`, append-only hash-chained audit log, route policy test, canary PII test, rate limits, CSRF & security headers.
  - [x] First Admin Bootstrap CLI (`pnpm admin:bootstrap`) with one-time 15-min enrollment token.
- [x] Phase 2: Design System & Motion (`packages/ui`)
  - [x] Tiranga design tokens (verified contrast in docs/DESIGN_TOKENS.md).
  - [x] Brand SVG assets (24-spoke Chakra ring + Setu bridge arc).
  - [x] 5 accessible motion components: Civic Flow, Chakra Progress Ring, Verification Path, Civic Pulse, Smart Loading.
  - [x] Accessible UI component library (Buttons, Modals, Forms, Alerts, Chips, Tables, Tabs).
- [x] Phase 3: Citizen Portal (`apps/web`)
  - [x] Landing page with hero, independent portal notice, 8 service cards, verification path, methodology.
  - [x] Auth flows (Register, Sign-in, 18+ check, Consent notice, Recovery).
  - [x] Citizen Dashboard (/app) with Chakra Progress Ring and activity timeline.
  - [x] Voter Details Check (/app/check) with 5 allowed outcomes.
  - [x] Missing-Name Wizard (/app/missing-name) with PDF Application Preparation Sheet.
  - [x] Corrections & Issue Intake (/app/issues/new).
  - [x] Own-Duplicate Self-Check (/app/duplicate-self-check).
  - [x] Deceased-Person Reporting (/app/report/deceased) with anti-weaponization safeguards.
  - [x] Case Tracking (/app/cases, /app/cases/:ref) with official submission reporting.
  - [x] Voluntary Contact Check-in (/app/checkin).
  - [x] Assisted Support (/app/assist) with representative authorization.
  - [x] Settings & DPDP Rights (/app/settings/*) with data export and erasure.
  - [x] Stateless /eligibility-check for under-18 and unregistered visitors.
- [x] Phase 4: Admin & Reviewer Portal (`apps/admin`)
  - [x] Admin overview with KPI cards, demo data labels, integration health.
  - [x] Case queue with filtering, assignment, and state machine transition guards.
  - [x] Document review with short-lived URLs and audit logging.
  - [x] Duplicate review with rule-based scoring and 4-eyes approval for verified discrepancies.
  - [x] Deceased report review with anti-abuse escalation patterns.
  - [x] Guidance editor with versioning and verification flags.
  - [x] Staff RBAC management.
  - [x] Audit log hash-chain verification tool.
  - [x] Suppressed analytics (k ≥ 10, district level only).
- [x] Phase 5: Verification, Testing & Deliverables
  - [x] Unit & integration tests for all packages (50 passing tests across 7 suites).
  - [x] Route policy coverage test (`src/__tests__/route-policy-coverage.test.ts`).
  - [x] Canary PII in logs test (`src/__tests__/canary-pii-logger.test.ts`).
  - [x] Duplicate-detection scoring tests with synthetic test cases.
  - [x] Security & state-machine guard tests.
  - [x] Performance and accessibility documentation (`docs/PERFORMANCE.md`, `docs/ACCESSIBILITY.md`).
  - [x] Legal review, incident response, integrations, tokens, environment, limitations, and deployment documentation.
  - [x] Docker Compose orchestration and Dockerfiles.
  - [x] Final Implementation Report (§30).
  - [x] Frontend Design & Layout Harmonization (§31): Full integration of the user's authentic HTML/CSS layout (Tricolor Civic Flow hero, 24-spoke Ashoka Chakra animated SVG, notice card, 8-service grid, 3-step verification path with animated tabs, two-track comparison with 24-spoke chakra progress ring, ruled privacy list, and 5-column footer), while preserving all functional subpages and SPA workflows.
  - [x] Fixed Ashoka Chakra Background (§32): Integrated faint fixed 24-spoke rotating Chakra watermark (`.chakra-bg`, opacity 0.06 in light mode / 0.08 in dark mode). Hidden while viewing the home hero section (`#top`), and smoothly fades in once scrolled past the hero, as well as appearing on all subpages (`/app`, `/app/check`, `/app/missing-name`, etc.).
  - [x] Removed White Section Layout Overlays (§33): Removed the light/milky `.sec-alt` background block (`rgb(248 242 230 / .72)`) from the Privacy, How, and Notice sections. Background is now completely transparent and continuous across all sections, eliminating the discolored greyish-white layout band shown in dark mode and light mode while allowing the rotating Ashoka Chakra to shine through uniformly.



### 8. Ashoka Chakra Background Watermark & Hero Animation Lifecycle
- **Loading Flash Elimination**:
  - The static `<svg class="chakra-bg">` was removed from raw `index.html` to eliminate the unstyled black/white SVG disc flash during initial page load/parsing before CSS is evaluated.
  - The watermark is encapsulated into `<ChakraBackground />` in React, mounting with CSS rules and fixed positioning already in place.
  - Controlled by the `.past-hero` class on `document.documentElement`: opacity remains `0` over the home hero and smoothly transitions (`transition: opacity .9s ease`) to subtle watermark opacity (`0.06` light / `0.08` dark) only when scrolled past the hero or on subpages.
- **Hero Intro Animation Lifecycle**:
  - A pre-paint `<script>` in `<head>` initializes `document.documentElement.classList.add('motion')` unless `liteMode` or `prefers-reduced-motion` is active.
  - Animation keyframes (`wipe`, `fade-a`, `fade-b`, `fade-c`, `spoke`, `sheen`) run smoothly on opening the website.
  - When Lite Mode or reduced motion is active, `.art.paused *, .lite .art *` cleanly applies `animation: none !important; opacity: 1 !important; transform: none !important;` to ensure crisp static rendering without half-state invisibility.

### 9. Dark & Light Theme System
- **Dark Mode (Default)**:
  - Preserves the exact rich dark navy frontend colors: `--bg: #080B20`, `--surface: #0F1330`, periwinkle borders and accents (`--ring: #AEB8FF`), saffron call-to-actions, and glowing Tricolor Civic Flow.
- **Light Mode (Pure White Background)**:
  - Switched via `:root[data-theme="light"]`:
  - Pure white background: `--bg: #FFFFFF`.
  - Crisp cards: `--surface: #FFFFFF`, subtle dividing lines: `--line: #E2E8F0`.
  - Deep ink typography: `--ink: #0B1030` with chakra navy buttons (`#000080`) and tricolor accents.
- **Seamless Theme Switching**:
  - Pre-paint theme detection in `<head>` of `index.html` prevents any theme flashing during initial paint.
  - Switch in the header dynamically toggles between `🌙 Dark mode` and `☀️ Light mode` and persists the selection in `localStorage` under `'voterrule_theme'`.
