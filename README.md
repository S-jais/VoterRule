# VoterRule
### Independent Electoral-Roll Verification & Inclusion-Assistance Portal

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-4.26-black.svg)](https://www.fastify.io/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38b2ac.svg)](https://tailwindcss.com/)
[![WCAG 2.2 AA](https://img.shields.io/badge/WCAG-2.2%20AA%20Compliant-brightgreen.svg)](docs/ACCESSIBILITY.md)
[![Tests Passing](https://img.shields.io/badge/Tests-43%2F43%20Passing-success.svg)](docs/PLAN.md)

---

## 1. Operating Charter & Civic Guardrails

VoterRule is an **independent, non-partisan civic-assistance platform** designed to make it safer, easier, and more transparent for eligible Indian citizens to check their electoral-roll status, understand potential issues, prepare statutory applications (Forms 6, 6A, 6B, 7, and 8), and track assistance cases.

### Core Legal & Ethical Guardrails:
1. **Independent Civic Platform:** Never impersonates or claims affiliation with the Election Commission of India (ECI), Chief Electoral Officers (CEOs), or any government body. No State Emblems, official seals, or government crests are used.
2. **Decoupled Truth States:**
   - **System A (Official Statutory Stage):** Reflects statutory reality (`OFFICIAL_SUBMISSION_CONFIRMED`, `ROLL_INCLUSION_INDEPENDENTLY_CONFIRMED`). Can **never** be updated by the citizen or an AI model alone; requires verified documentary evidence or authorized integration events.
   - **System B (Portal Workflow Status):** Reflects administrative case work (`UNDER_REVIEW`, `OFFICIAL_PROCESS_RECOMMENDED`).
   - The UI never displays "Success", "Verified", or "Included" unless verified statutory gazettes or official endorsements exist.
3. **Zero Aadhaar Collection:** The portal **never** requests or stores Aadhaar numbers. The UI actively instructs citizens to mask the first 8 digits of identity proofs. Voluntary Aadhaar intimation (Form 6B) is redirected exclusively to the official ECI portal.
4. **Zero Biometrics / Facial Recognition:** No face detection, selfies, or biometric algorithms are employed anywhere in the system.
5. **Protection of Minors (DPDP Section 9):** Citizens under 18 years of age receive a **100% stateless, zero-data-stored** questionnaire (`/eligibility-check`) that never writes to databases, server logs, or local storage.
6. **Zero Accusatory Vocabulary:** Prohibits defamatory or stigmatizing terms (`fake voter`, `duplicate voter`, `ghost voter`, `fraud`). An automated AST/regex linter rejects these terms across code, schemas, and UI copy.
7. **Rate-Limited Third-Party Reporting:** Reports of deceased electors or address relocations are capped at **3 per 30-day window per account** to prevent mass surveillance or voter harassment.
8. **Cryptographic Integrity & Privacy:** Field-level AES-256-GCM envelope encryption, HMAC-SHA256 blind indexing, and an append-only cryptographically linked SHA-256 audit ledger.

---

## 2. Monorepo Architecture

```
voterrule/
├── apps/
│   ├── web/            # Citizen Web Application (React 18 + Vite + Tailwind CSS)
│   ├── admin/          # Reviewer & Admin Application (React 18 + Vite + Tailwind CSS)
│   └── api/            # Backend REST API Gateway (Node.js + Fastify + Zod + OpenAPI)
├── packages/
│   ├── shared/         # Zod schemas, state machines, Crockford Base32 IDs, central policy
│   ├── guidance/       # Statutory forms engine (6, 6A, 6B, 7, 8), revision calendars, checklists
│   ├── i18n/           # English & Hindi dictionaries, ICU interpolation, formatters
│   └── ui/             # Tiranga design tokens, 24-spoke Chakra mark, motion primitives
└── docs/               # Comprehensive legal, security, architecture, and deployment specs
```

---

## 3. Prerequisites

* **Node.js:** v20.x or higher (tested and verified on Node.js v25.8.2)
* **Package Manager:** `pnpm` v9.x or higher (`corepack enable && corepack prepare pnpm@latest --activate`)
* **Operating System:** Windows, macOS, or Linux
* *(Optional)* Docker & Docker Compose for containerized staging deployments

---

## 4. Quick Start (Demo Mode)

The repository includes a zero-dependency in-memory/embedded database adapter and synthetic seeds, allowing full end-to-end local execution without needing Docker or a local PostgreSQL instance running.

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/S-jais/VoterRule.git
cd voterrule

# Install monorepo dependencies
pnpm install
```

### 2. Configure Environment
```bash
# Copy example configuration (defaults to APP_MODE=demo)
cp .env.example .env
```

### 3. Build All Workspace Packages
```bash
pnpm build
```

### 4. Run the Full Test Suite
```bash
pnpm test
```
*Executes all 43 unit and integration tests across 7 test suites.*

### 5. Launch the Applications
```bash
# Concurrently starts API (port 4000), Web (port 3000), and Admin (port 4001)
pnpm dev
```

* **Citizen Portal:** Open [http://localhost:3000](http://localhost:3000)
* **Staff / Admin Portal:** Open [http://localhost:4001](http://localhost:4001)
* **Interactive OpenAPI Swagger Docs:** Open [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 5. Pre-Seeded Test Credentials (Demo Mode)

| Role | Username / Identifier | Password | Second Factor (TOTP / SMS) |
|:---|:---|:---:|:---:|
| **Citizen (Email)** | `citizen@example.com` | `Password123!` | Not required |
| **Citizen (Mobile)** | `+919876543210` | N/A | SMS OTP: `123456` |
| **Reviewer / Staff** | `reviewer@voterrule.org` | `Password123!` | TOTP: `123456` |
| **Platform Administrator**| `admin@voterrule.org` | `Password123!` | TOTP: `123456` |

---

## 6. First-Administrator Bootstrap CLI

In fresh production environments where no accounts exist, execute the bootstrap CLI to issue a single-use, 15-minute onboarding token:

```bash
pnpm --filter @voterrule/api admin:bootstrap
```

Output:
```
==============================================================
   VOTERRULE - FIRST ADMINISTRATOR ONBOARDING CLI
==============================================================
[BOOTSTRAP SUCCESS] Single-use onboarding URL generated:
http://localhost:4001/auth/bootstrap?token=ms_boot_49a88f72c6e7bb1...
Token expires in 15 minutes.
==============================================================
```

---

## 7. Cryptographic Audit Chain Verification

To verify the tamper-evident SHA-256 audit chain of administrative and case actions:

```bash
pnpm --filter @voterrule/api exec node dist/cli/verify-audit-chain.js
```
*Returns `CHAIN_VERIFIED_INTACT` with the genesis hash and head block sequence.*

---

## 8. Documentation Index

Detailed architectural and regulatory documentation is available in the [`docs/`](docs/) directory:

* [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): System architecture, cryptographic envelope encryption, and state machines.
* [`docs/DECISIONS.md`](docs/DECISIONS.md): Architectural decisions log, trade-offs, and compliance assumptions.
* [`docs/DATA_INVENTORY.md`](docs/DATA_INVENTORY.md): DPDP Act compliance, data retention, and cryptographic disposal schedules.
* [`docs/LEGAL_REVIEW.md`](docs/LEGAL_REVIEW.md): Pre-launch briefing for legal counsel and statutory compliance checklist.
* [`docs/INCIDENT_RESPONSE.md`](docs/INCIDENT_RESPONSE.md): Breach notification runbook aligned with DPDP Rules and CERT-In 6-hour reporting.
* [`docs/INTEGRATIONS.md`](docs/INTEGRATIONS.md): Official Roll Lookup Provider adapter and Guided Manual verification fallback.
* [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md): Measured bundle size results (Web: 98.59 kB gzip JS; Admin: 71.90 kB gzip JS).
* [`docs/ACCESSIBILITY.md`](docs/ACCESSIBILITY.md): WCAG 2.2 AA statement, contrast audit table, and keyboard walkthrough.
* [`docs/ADD_A_LANGUAGE.md`](docs/ADD_A_LANGUAGE.md): Step-by-step guide for adding a new language as a zero-refactor data change.
* [`docs/DESIGN_TOKENS.md`](docs/DESIGN_TOKENS.md): Saffron, Green, and Navy color scales, typography, and motion primitives.
* [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md): Exhaustive environment variable reference and fail-closed configurations.
* [`docs/KNOWN_LIMITATIONS.md`](docs/KNOWN_LIMITATIONS.md): Honest disclosure of unavailable integrations and statutory boundary conditions.
* [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md): Containerized production architecture, fail-closed pre-flight checks, and backup procedures.

---

## 9. License & Civic Statement

VoterRule is an open civic initiative. All code is licensed under the Apache License 2.0.  
*Voter empowerment. Constitutional neutrality. Privacy by design.*
