# Legal & Regulatory Review Brief: Matdata Setu (मतदाता सेतु)

> **Document Status:** Pre-Launch Legal Counsel Briefing  
> **Applicable Jurisdictions:** Republic of India  
> **Key Statutes:** Digital Personal Data Protection Act, 2023 (DPDP Act) & Draft DPDP Rules; Representation of the People Act, 1950 & 1951; Registration of Electors Rules, 1960; The Emblems and Names (Prevention of Improper Use) Act, 1950; State Emblem of India (Prohibition of Improper Use) Act, 2005; Flag Code of India, 2002; Information Technology Act, 2000 (Section 43A, 70B & Intermediary Guidelines).

---

## 1. Executive Summary & Purpose

Matdata Setu is an **independent civic-assistance platform** designed to help eligible Indian citizens verify their electoral-roll status, prepare statutory applications (Forms 6, 6A, 6B, 7, and 8), and track civic assistance cases. 

The platform **is not affiliated with, authorized by, or an agent of the Election Commission of India (ECI), Chief Electoral Officers (CEOs), or any government authority**. 

This document outlines the mandatory legal checks and compliance validations required by external legal counsel and internal data protection officers prior to production deployment.

---

## 2. DPDP Act Compliance & Data Fiduciary Responsibilities

### 2.1 Lawful Basis for Processing
* **Citizen Self-Submissions:** Processing is strictly anchored in explicit, informed, affirmative consent given at the point of submission under Section 6 of the DPDP Act. Consent notices are bilingual (English and Hindi), clear, itemized, and accompanied by the right to withdraw consent and request erasure.
* **Third-Party Submissions (Deceased Electors / Relocation Reports):**
  * Rate-limited to a maximum of 3 submissions per 30-day window per account to eliminate bulk targeting or surveillance.
  * Information provided is treated strictly as an *intimation request* for human administrative review; it is never published, indexed, or shared with third parties.
  * Counsel review required: Validation of legitimate uses under Section 7 or consent exemptions for civic grievance facilitation.

### 2.2 Processing of Children's Data (Electors Aged < 18)
* Under Section 9 of the DPDP Act, data fiduciaries have onerous verification obligations before processing personal data of children (defined as individuals under 18 years of age).
* **Architectural Safeguard:** Matdata Setu enforces an **absolute zero-data-stored, stateless model** for prospective electors aged 17+ who wish to check advance qualifying dates.
* Account creation is hard-gated to electors who certify they are 18 years or older.
* Electors aged 17 receive guidance via a client-side stateless questionnaire (`/eligibility-check`) that writes zero data to backend databases, server logs, or browser storage.
* *Counsel Action:* Confirm that the stateless guidance does not trigger DPDP child-data fiduciary obligations.

### 2.3 Aadhaar Number Prohibition & Redaction
* Under the Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act, 2016 and the *Puttaswamy* judgment, non-governmental private entities are prohibited from requiring or storing Aadhaar numbers without explicit statutory authorization.
* **Matdata Setu Policy:**
  1. The portal **never** requests, collects, or stores Aadhaar numbers.
  2. The database schema has no Aadhaar field.
  3. Every document upload UI displays a prominent warning instructing citizens to **mask the first 8 digits** of any submitted proof document, leaving only the last 4 visible.
  4. Form 6B (voluntary Aadhaar intimation to ECI) is clearly documented as an official-only statutory submission and redirected to the official ECI portal (`voters.eci.gov.in`).

### 2.4 Data Retention & Cryptographic Disposal
* In accordance with DPDP storage limitation principles:
  * Closed citizen cases are retained for a maximum of **90 days** post-resolution before automatic redaction.
  * Uploaded document proof files are retained for **30 days** post-case closure.
  * Document access tokens expire after **60 seconds** via signed short-lived URLs.
  * Field-level PII (names, contact details) is encrypted with AES-256-GCM. Deletion rotates or purges specific record encryption keys, ensuring cryptographic erasure even across cold backups.
* *Counsel Action:* Validate that 90-day retention satisfies civil limitation statutes while complying with data minimization.

---

## 3. National Symbols & Government Representation Compliance

### 3.1 The Emblems and Names (Prevention of Improper Use) Act, 1950 & State Emblem Act, 2005
* **Strict Avoidance:** The platform does **not** display:
  * The State Emblem of India (Lion Capital of Ashoka).
  * The official seal, logo, or trademark of the Election Commission of India.
  * Any graphic, insignia, or favicon that mimics government seals or official departmental headers.

### 3.2 Flag Code of India, 2002
* The visual design is **Tiranga-inspired** (Warm Saffron `#C25E00`, Deep Saffron `#9A4500`, India Green `#0D5C05`, Navy `#0B1030`), but **does not reproduce the National Flag of India**.
* The Chakra mark is an **original 24-spoke geometric SVG construction** representing civic momentum and constitutional continuity, styled without flag proportions or official crest layouts.
* *Counsel Action:* Review visual assets to confirm compliance with Section 3 of the Emblems and Names Act.

### 3.3 Mandatory Non-Affiliation Disclaimers
* A persistent, prominent notice appears across the global footer, header banners, and case export sheets:
  > *"Matdata Setu is an independent civic-assistance platform and is not affiliated with the Election Commission of India or any government body. Official electoral-roll decisions are made solely by statutory Electoral Registration Officers (EROs)."*
* Portal reference identifiers use the Crockford Base32 pattern `MS-2026-XXXXXXXX` and are always labeled: *"Portal reference (not an official ECI acknowledgement number)"*.

---

## 4. Defamation, Accusatory Vocabulary & Civic Neutrality

### 4.1 Strict Vocabulary Sanitization
* The platform enforces an automated AST-based and regex-based build-time linter prohibiting accusatory or stigmatizing terminology in code, database enums, API payloads, and UI copy.
* Prohibited terms: `fake voter`, `bogus voter`, `ghost voter`, `duplicate voter`, `illegal voter`, `fraud`, `vote thief`.
* Allowed neutral terms: `Multiple potential registrations under review`, `Inconsistent roll entry`, `Unverified record`.
* *Legal Justification:* Precludes claims of criminal defamation (Section 499/500 IPC / Bharatiya Nyaya Sanhita) or civil torts arising from potential erroneous flags.

### 4.2 Decoupled Truth States (System A vs System B)
* **System A (Official Statutory Stage):** Reflects statutory reality (`OFFICIAL_SUBMISSION_CONFIRMED`, `OFFICIAL_DECISION_RECEIVED`, etc.). Can **never** be updated by the citizen or an AI model alone; requires verified statutory documentation or direct integration events.
* **System B (Portal Workflow Status):** Reflects administrative case work (`UNDER_REVIEW`, `OFFICIAL_PROCESS_RECOMMENDED`, etc.).
* The UI never displays "Success", "Verified", or "Included in Electoral Roll" unless an official statutory gazette or verified ERO endorsement exists.

---

## 5. Telecommunications & Messaging Regulations

### 5.1 TRAI DLT Registration (Telecom Commercial Communications Customer Preference Regulations, 2018)
* All SMS and OTP communications must be sent under registered DLT (Distributed Ledger Technology) Entity IDs and Principal Entity (PE) headers.
* Message templates must be pre-approved as **Service Implicit / Transactional** and include statutory voter helpline reference **1950**.
* *Counsel Action:* Review proposed SMS and WhatsApp notification templates against TRAI promotional vs. transactional guidelines.

---

## 6. Pre-Launch Sign-Off Checklist for Counsel

| Ref | Review Area | Statutory Reference | Sign-Off Status |
|:---|:---|:---|:---:|
| **LR-01** | Non-affiliation disclaimers and typography | Consumer Protection Act, 2019 / Emblems Act | Required |
| **LR-02** | Consent notice wording & DPDP compliance | DPDP Act, 2023 §6 & Draft Rules | Required |
| **LR-03** | Stateless minor guidance (<18 years) | DPDP Act, 2023 §9 | Required |
| **LR-04** | Third-party intimation & defamation indemnity | BNS / Information Technology Act §79 | Required |
| **LR-05** | Aadhaar masking compliance & guidance | Aadhaar Act, 2016 §29 | Required |
| **LR-06** | 90-day retention & cryptographic disposal | DPDP Storage Limitation | Required |
| **LR-07** | TRAI DLT SMS templates & 1950 helpline usage | TCCCPR 2018 | Required |
