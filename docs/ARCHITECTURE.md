# VoterRule - Architecture & System Design

## 1. System Topology & Trust Boundaries

```
[ Citizen Web App (apps/web) ]         [ Admin / Reviewer App (apps/admin) ]
            │                                             │
      (Port 3000)                                   (Port 4001)
            │                                             │
            └──────────────────────┬──────────────────────┘
                                   │
               [ REST API Gateway: /api/v1 (apps/api) ]
                                   │
   ┌───────────────────────────────┴───────────────────────────────┐
   │                                                               │
   ▼                                                               ▼
[ Central Policy: can() ]                              [ Append-Only Audit Chain ]
   │                                                               │
   ▼                                                               ▼
[ Database Repository Layer ]                          [ Storage & Virus Scan ]
  - PostgreSQL (Production)                              - Private Bucket (S3/MinIO)
  - Embedded Store (Demo/Local)                          - ClamAV Scanner Adapter
   │                                                               │
   ▼                                                               ▼
[ Envelope Encryption (AES-256-GCM) ]                  [ Guidance Rules Engine ]
  - Master KEK / Cloud KMS                               - Versioned Statutory Seeds
  - HMAC Blind Indexing (Equality)                       - Decision Tree Recommender
  - Keyed HMAC Match Tokens (Blocking)                   - State Revision Schedules
```

## 2. The Two Independent Truth-State Systems
VoterRule strictly decouples portal workflow from real-world election authority decisions:
- **System A: Official-Process Stage (What has occurred in statutory reality):**
  1. `ACCOUNT_CREATED`
  2. `INFO_SUBMITTED_TO_PORTAL`
  3. `DOCUMENTS_RECEIVED_FOR_REVIEW`
  4. `APPLICATION_PREPARED`
  5. `SUBMITTED_VIA_OFFICIAL_CHANNEL_USER_REPORTED`
  6. `OFFICIAL_SUBMISSION_CONFIRMED` *(Guarded)*
  7. `OFFICIAL_DECISION_RECEIVED` *(Guarded)*
  8. `ROLL_INCLUSION_INDEPENDENTLY_CONFIRMED` *(Guarded)*
  *Guards:* Stages 6–8 cannot be modified by citizen input or AI. They require verified documentary evidence and reviewer sign-off or an authorized integration event.
- **System B: Portal-Case Workflow Status (What the civic team is doing):**
  `DRAFT` → `SUBMITTED_TO_PORTAL` → `AWAITING_INITIAL_REVIEW` → `ADDITIONAL_INFO_REQUIRED` ↔ `UNDER_REVIEW` → `OFFICIAL_PROCESS_RECOMMENDED` → `OFFICIAL_SUBMISSION_REPORTED_BY_USER` → `CLOSED` / `REOPENED`.

## 3. Cryptography & Key Management
- **Field-Level Envelope Encryption:** Sensitive identifiers are encrypted with AES-256-GCM using unique 96-bit initialization vectors (IVs) and authentication tags.
- **Blind Indexing:** Equality lookups (email and EPIC lookups) utilize HMAC-SHA-256 with a dedicated `BLIND_INDEX_SECRET` distinct from encryption keys.
- **Match Tokens:** Blocking candidate matching uses a separate `MATCH_TOKEN_SECRET`. Hashes of low-entropy fields (names, birth years) are never treated as anonymized.
- **Audit Hash Chain:** Every audit event includes `prevHash` and a cryptographic SHA-256 hash linking the sequence. Any modification or deletion breaks the hash chain.
