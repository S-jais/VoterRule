# Matdata Setu - Data Inventory & DPDP Act 2023 Lawful Basis

Under the Digital Personal Data Protection (DPDP) Act, 2023 and the DPDP Rules, 2025, personal data processing must adhere to strict purpose limitation, data minimization, and lawful processing bases.

| Entity / Field | Description | Sensitivity / Processing Mode | Purpose & Statutory Necessity | Lawful Basis | Retention Period | Access Roles |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **User: email** | Citizen contact identifier | Encrypted (AES-256-GCM) + HMAC Blind Index | Account authentication and case notifications | Explicit consent (Section 6) | Account lifetime + 30 days post-closure | Self, Admin (masked by default) |
| **User: passwordHash** | Salted Scrypt key | One-way derived hash | Account authentication | Section 6 consent | Account lifetime | None (Automated verification only) |
| **User: ageConfirmed18Plus** | Confirmation of adult status | Plain boolean | Compliance with Section 9 (prohibition of processing child data without parental verification) | Statutory duty (Section 9) | Account lifetime | Self, Auditor |
| **Electoral: nameAsReported** | Applicant name for Form 6/7/8 | Encrypted in transit & rest | Preparation of statutory election application sheet | Section 6 consent | Open case duration + 90 days | Self, Case Reviewer |
| **Electoral: relativeName** | Father/Mother/Spouse name | Encrypted in transit & rest | Statutory requirement for elector identification | Section 6 consent | Open case duration + 90 days | Self, Case Reviewer |
| **Electoral: dobYear** | Year of birth | Encrypted integer | Age verification against statutory qualifying dates (Jan 1, Apr 1, Jul 1, Oct 1) | Section 6 consent | Open case duration + 90 days | Self, Case Reviewer |
| **Electoral: addressSummary** | Postal address | Encrypted in transit & rest | Determination of ordinary residence (Section 20 RPA 1950) | Section 6 consent | Open case duration + 90 days | Self, Case Reviewer |
| **Electoral: optionalEpicMasked** | Prior EPIC card number | Masked (ABC***1234) | Tracing prior voter record; never stored unmasked without review reason | Section 6 consent | Case duration | Self, Case Reviewer (masked by default) |
| **Document: uploadedProofs** | Age/Address proof files | Private storage + virus scanned | Factual review of inclusion eligibility | Section 6 consent | 90 days post-case resolution | Self, Document Reviewer |
| **Third-Party: deceasedReports** | Report of deceased elector | Encrypted + restricted view | Assistance to family for official roll maintenance (Form 7) | Legal compliance / legitimate interest | Until official resolution | Reviewer only (never public) |
| **Audit: audit_events** | Tamper-evident activity logs | Append-only SHA-256 chain | Security monitoring and breach accountability (Section 8(6)) | Statutory duty | 3 years (audit trail) | Read-only Auditor, Platform Admin |

## Mandatory Prohibitions & Non-Collection
1. **Aadhaar Numbers:** Matdata Setu NEVER collects, asks for, or stores unmasked Aadhaar numbers. Citizens are required to mask the first 8 digits of any identity document before upload.
2. **Biometrics & Facial Recognition:** No face recognition, selfies, or biometric checks are implemented anywhere on the platform.
3. **Caste, Religion, or Community Data:** No fields collecting or inferring religion, caste, or ethnicity exist in schemas or algorithms.
