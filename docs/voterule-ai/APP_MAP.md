# VoteRule Application Knowledge Map (APP_MAP)

> Machine-generated knowledge map for VoteRule AI conversational assistant.
> Last Generated: 2026-11-01T06:17:35.859Z

## 1. Executive Summary & Routing Architecture

VoteRule operates a single-page reactive application using custom state-based client routing, with persistent global state across route transitions. The AI assistant is mounted at the root level and retains state during user navigation.

## 2. Route Registry & Gating

| Route ID | Path | Title | Auth Level | Feature Availability |
|---|---|---|---|---|
| `home` | `/` | VoteRule Home | ANY | `fully_implemented` |
| `check_voter_status` | `/app/check` | Electoral Roll Status Check & Record | ANY | `mocked_in_demo` |
| `missing_name_assistance` | `/app/missing-name` | Missing Name & Omission Assistance | ANY | `fully_implemented` |
| `dashboard` | `/app` | Citizen Civic Dashboard | CITIZEN | `fully_implemented` |
| `case_detail` | `/app/cases/:caseRef` | Assistance Case Details & Timeline | CITIZEN | `fully_implemented` |
| `duplicate_self_check` | `/app/duplicate-self-check` | Duplicate Registration Self-Check | ANY | `fully_implemented` |
| `deceased_person_report` | `/app/report/deceased` | Report Deceased Elector Entry for Verification | CITIZEN | `fully_implemented` |
| `eligibility_check` | `/eligibility-check` | Stateless Electoral Eligibility Guidance | ANY | `fully_implemented` |
| `assisted_support` | `/app/assist` | Assisted Support & Representative Authorization | ANY | `fully_implemented` |
| `checkin` | `/app/checkin` | Periodic Contact Check-in (Voluntary) | CITIZEN | `fully_implemented` |
| `how_it_works` | `/how-it-works` | How VoteRule Works | ANY | `fully_implemented` |
| `methodology` | `/methodology` | Verification Methodology & Civic Neutrality | ANY | `fully_implemented` |
| `privacy_policy` | `/privacy` | Privacy Policy & DPDP Notice | ANY | `fully_implemented` |
| `accessibility` | `/accessibility` | Accessibility Statement (WCAG 2.2 AA) | ANY | `fully_implemented` |
| `auth_login` | `/auth` | Citizen Sign In | ANY | `fully_implemented` |

## 3. Detailed Route Specifications

### VoteRule Home (`home`)

- **Path:** `/`
- **Purpose:** Independent civic-assistance platform landing page explaining how to verify electoral roll status, diagnose missing names, and prepare statutory ECI applications.
- **Auth Requirement:** ANY
- **Availability:** `fully_implemented` (Fully implemented interactive landing page with multilingual support and light/dark theme.)
- **Registered Sections:** `top`, `hero`, `quick-actions`, `features`, `guidance-summary`, `footer`
- **Highlightable UI Targets (`data-ai-target`):**
  - `home-check-btn`: Start voter status check button (selector: `[data-ai-target="home-check-btn"]`)
  - `home-missing-btn`: Missing from roll assistance button (selector: `[data-ai-target="home-missing-btn"]`)
  - `home-eligibility-btn`: Check voter eligibility button (selector: `[data-ai-target="home-eligibility-btn"]`)
  - `home-duplicate-btn`: Check duplicate registration button (selector: `[data-ai-target="home-duplicate-btn"]`)
  - `home-deceased-btn`: Report deceased elector entry button (selector: `[data-ai-target="home-deceased-btn"]`)
- **Official References:**
  - [Election Commission of India](https://www.eci.gov.in) 
  - [Voters Service Portal](https://voters.eci.gov.in) 

---

### Electoral Roll Status Check & Record (`check_voter_status`)

- **Path:** `/app/check`
- **Purpose:** Guides electors to perform official roll verification on voters.eci.gov.in and record the neutral outcome with timestamped provenance.
- **Auth Requirement:** ANY
- **Availability:** `mocked_in_demo` (In demo mode, automated roll lookup is simulated against synthetic seeds. Live lookups are performed directly on official ECI portal by the citizen, and result is recorded here.)
- **Registered Sections:** `check-header`, `official-search-link`, `record-outcome-form`, `status-notes`
- **Required Inputs:** State, EPIC Number (or name details)
- **Highlightable UI Targets (`data-ai-target`):**
  - `check-epic-input`: EPIC Number input field (selector: `[data-ai-target="check-epic-input"]`)
  - `check-state-select`: State/UT dropdown selector (selector: `[data-ai-target="check-state-select"]`)
  - `check-simulate-btn`: Simulate/Verify button (selector: `[data-ai-target="check-simulate-btn"]`)
  - `check-outcome-selector`: Official outcome radio buttons (selector: `[data-ai-target="check-outcome-selector"]`)
  - `check-save-btn`: Save check outcome button (selector: `[data-ai-target="check-save-btn"]`)
- **Status Values & Meanings:**
  - `CONFIRMED_PRESENT_IN_OFFICIAL_RESULT`: Your name, EPIC, and polling station were located on the official roll.
  - `NOT_FOUND_IN_CHECKED_SEARCH`: The official search returned zero matching records for the details entered.
  - `DETAILS_APPEAR_INCONSISTENT`: Record was located, but spelling, age, relative name, or address differs from current reality.
  - `SEARCH_COULD_NOT_BE_COMPLETED`: Technical timeout, official server downtime, or OTP not received on official portal.
  - `NEEDS_FURTHER_VERIFICATION`: Multiple similar records found or ambiguous assembly constituency boundaries.
- **Official References:**
  - [ECI Electoral Search](https://electoralsearch.eci.gov.in) (National Electoral Roll Search)

---

### Missing Name & Omission Assistance (`missing_name_assistance`)

- **Path:** `/app/missing-name`
- **Purpose:** Assists citizens whose name was omitted or deleted from the electoral roll in diagnosing the issue, collecting necessary facts, and preparing official Form 6.
- **Auth Requirement:** ANY
- **Availability:** `fully_implemented` (Creates an in-app assistance case with Crockford Base32 case reference and prepares Form 6 application preparation sheet.)
- **Registered Sections:** `step-prior-entry`, `step-personal-info`, `step-location`, `step-verification-date`, `step-consent`, `step-summary`
- **Required Inputs:** Full Name, Relative Name, Year of Birth, State, District, Assembly Constituency, Address, Informed Consent
- **Highlightable UI Targets (`data-ai-target`):**
  - `missing-name-input`: Full legal name input field (selector: `[data-ai-target="missing-name-input"]`)
  - `missing-relative-input`: Relative name input field (selector: `[data-ai-target="missing-relative-input"]`)
  - `missing-state-select`: State selector dropdown (selector: `[data-ai-target="missing-state-select"]`)
  - `missing-constituency-input`: Assembly constituency input field (selector: `[data-ai-target="missing-constituency-input"]`)
  - `missing-consent-checkbox`: Informed consent checkbox (selector: `[data-ai-target="missing-consent-checkbox"]`)
  - `missing-submit-btn`: Create assistance case button (selector: `[data-ai-target="missing-submit-btn"]`)
- **Status Values & Meanings:**
  - `DRAFT`: Case information entered but not yet saved.
  - `SUBMITTED_TO_PORTAL`: Case recorded on VoteRule and queued for statutory guidance.
  - `AWAITING_INITIAL_REVIEW`: Awaiting review by VoteRule case specialist.
  - `OFFICIAL_PROCESS_RECOMMENDED`: Recommended official form (Form 6) preparation sheet generated.
- **Official References:**
  - [ECI Form 6 - Inclusion of Name](https://voters.eci.gov.in) (Registration of Electors Rules 1960 (Rule 13(1) & 26))

---

### Citizen Civic Dashboard (`dashboard`)

- **Path:** `/app`
- **Purpose:** Unified view of the citizen’s recorded status checks, active assistance cases, statutory revision schedules, and official next steps.
- **Auth Requirement:** CITIZEN
- **Availability:** `fully_implemented` (Fetches user cases and status checks from API with session owner isolation.)
- **Registered Sections:** `dashboard-summary`, `recent-checks`, `active-cases`, `ssr-deadlines`, `support-actions`
- **Highlightable UI Targets (`data-ai-target`):**
  - `dashboard-new-check-btn`: Perform new status check button (selector: `[data-ai-target="dashboard-new-check-btn"]`)
  - `dashboard-active-case-card`: Active case status card (selector: `[data-ai-target="dashboard-active-case-card"]`)
- **Status Values & Meanings:**
  - `DRAFT`: Assistance case in draft state.
  - `SUBMITTED_TO_PORTAL`: Case submitted to VoteRule for guidance.
  - `UNDER_REVIEW`: Case specialist evaluating statutory options.
  - `OFFICIAL_PROCESS_RECOMMENDED`: Form preparation guidance ready for citizen.
  - `CLOSED`: Case resolved or concluded.
- **Official References:**
  - [ECI Special Summary Revision (SSR) Guidelines](https://www.eci.gov.in) 

---

### Assistance Case Details & Timeline (`case_detail`)

- **Path:** `/app/cases/:caseRef`
- **Purpose:** Deep view of a specific civic assistance case, showing statutory two-system stage progression, audit events, and PDF generation.
- **Auth Requirement:** CITIZEN
- **Availability:** `fully_implemented` (Stages 6-8 are strictly guarded and cannot be advanced by self-reporting alone.)
- **Registered Sections:** `case-header`, `two-system-tracker`, `audit-history`, `document-checklist`, `guidance-actions`
- **Required Inputs:** caseRef
- **Highlightable UI Targets (`data-ai-target`):**
  - `case-download-sheet-btn`: Download Application Preparation Sheet button (selector: `[data-ai-target="case-download-sheet-btn"]`)
  - `case-report-official-btn`: Report official submission button (selector: `[data-ai-target="case-report-official-btn"]`)
- **Status Values & Meanings:**
  - `ACCOUNT_CREATED`: Account created on civic portal.
  - `INFO_SUBMITTED_TO_PORTAL`: Case details submitted for assistance.
  - `APPLICATION_PREPARED`: Statutory preparation sheet generated for Form 6/7/8.
  - `SUBMITTED_VIA_OFFICIAL_CHANNEL_USER_REPORTED`: Citizen reported submitting application to ECI.
  - `OFFICIAL_SUBMISSION_CONFIRMED`: Reviewed against official ECI acknowledgement slip.
  - `OFFICIAL_DECISION_RECEIVED`: Statutory ERO decision issued.
  - `ROLL_INCLUSION_INDEPENDENTLY_CONFIRMED`: Name independently verified as appearing in the published roll.
- **Official References:**
  - [ECI Application Tracking](https://voters.eci.gov.in) (Track Application Status)

---

### Duplicate Registration Self-Check (`duplicate_self_check`)

- **Path:** `/app/duplicate-self-check`
- **Purpose:** Allows citizens to identify and resolve redundant electoral entries across different addresses or assembly constituencies under Section 17 & 18 RPA 1950.
- **Auth Requirement:** ANY
- **Availability:** `fully_implemented` (Evaluates equality using HMAC blind indexing and blocking match tokens. Name similarity alone does NOT prove identity.)
- **Registered Sections:** `duplicate-intro`, `duplicate-form`, `duplicate-results`, `duplicate-guidance`
- **Required Inputs:** Full Name, Current State, Current Address, Previous State (Optional), Previous Address (Optional)
- **Highlightable UI Targets (`data-ai-target`):**
  - `duplicate-name-input`: Full name input for duplicate check (selector: `[data-ai-target="duplicate-name-input"]`)
  - `duplicate-state-select`: Current state dropdown selector (selector: `[data-ai-target="duplicate-state-select"]`)
  - `duplicate-submit-btn`: Run duplicate self-check button (selector: `[data-ai-target="duplicate-submit-btn"]`)
- **Status Values & Meanings:**
  - `NO_DUPLICATE_FOUND`: No matching duplicate records found in synthetic index.
  - `POTENTIAL_MATCH_SAME_CONSTITUENCY`: Potential multiple entries within the same assembly constituency.
  - `POTENTIAL_MATCH_DIFFERENT_STATE`: Potential un-deleted prior registration in another state/district.
- **Official References:**
  - [Representation of the People Act 1950](https://www.indiacode.nic.in) (Sections 17 and 18 (No person registered in more than one constituency))
  - [ECI Form 8 - Shifting / Deletion of Previous Entry](https://voters.eci.gov.in) (Form 8 / Form 7)

---

### Report Deceased Elector Entry for Verification (`deceased_person_report`)

- **Path:** `/app/report/deceased`
- **Purpose:** Allows immediate family or verified neighbours to report a deceased person entry to prevent roll bloat, guarded by anti-weaponization limits and mandatory ERO physical verification.
- **Auth Requirement:** CITIZEN
- **Availability:** `fully_implemented` (Enforces max 3 reports per citizen per 30-day window. Explains that deletion requires statutory Form 7 and official ERO verification.)
- **Registered Sections:** `deceased-safeguards`, `deceased-form`, `deceased-consent`, `deceased-confirmation`
- **Required Inputs:** Reported Person Name, Relative Name, Approximate Age, State, Locality, Basis of Knowledge, Explanation
- **Highlightable UI Targets (`data-ai-target`):**
  - `deceased-name-input`: Name of deceased elector input (selector: `[data-ai-target="deceased-name-input"]`)
  - `deceased-basis-select`: Basis of knowledge selector (Immediate family, legal heir, etc.) (selector: `[data-ai-target="deceased-basis-select"]`)
  - `deceased-submit-btn`: Submit report for human review button (selector: `[data-ai-target="deceased-submit-btn"]`)
- **Status Values & Meanings:**
  - `RECEIVED`: Report received and queued for review.
  - `AWAITING_DEATH_CERTIFICATE`: Supporting official death record or verification requested.
  - `RECOMMENDED_FOR_FORM_7`: Guidance prepared for filing statutory Form 7 objection.
  - `REJECTED`: Report rejected due to insufficient basis or weaponization safeguard.
- **Official References:**
  - [ECI Form 7 - Objections & Deletions](https://voters.eci.gov.in) (Registration of Electors Rules 1960 (Rule 13(2)))
  - [Registration of Births and Deaths Act 1969](https://www.indiacode.nic.in) 

---

### Stateless Electoral Eligibility Guidance (`eligibility_check`)

- **Path:** `/eligibility-check`
- **Purpose:** Educational, anonymous questionnaire to evaluate voter eligibility under Article 326 of the Constitution of India and RPA 1950 without saving any data.
- **Auth Requirement:** ANY
- **Availability:** `fully_implemented` (100% stateless and anonymous. No personal data collected or stored. Safe for minors under 18 checking advance eligibility.)
- **Registered Sections:** `eligibility-intro`, `questions-form`, `evaluation-result`
- **Required Inputs:** Citizenship Status, Age / Qualifying Date, Disqualification Status
- **Highlightable UI Targets (`data-ai-target`):**
  - `eligibility-question-citizenship`: Citizenship question options (selector: `[data-ai-target="eligibility-question-citizenship"]`)
  - `eligibility-question-age`: Age and qualifying date options (selector: `[data-ai-target="eligibility-question-age"]`)
  - `eligibility-eval-btn`: Evaluate eligibility button (selector: `[data-ai-target="eligibility-eval-btn"]`)
- **Status Values & Meanings:**
  - `ELIGIBLE_NOW`: Meets citizenship, age, and ordinary residence requirements for immediate Form 6 enrollment.
  - `PROSPECTIVE_ELECTOR`: Aged 17+ turning 18 on one of the four qualifying dates (1 Jan, 1 Apr, 1 Jul, 1 Oct). Eligible for advance Form 6.
  - `NOT_ELIGIBLE`: Currently does not meet statutory eligibility conditions.
- **Official References:**
  - [Constitution of India, Article 326](https://www.indiacode.nic.in) (Article 326 - Universal Adult Suffrage)
  - [Representation of the People Act 1950](https://www.indiacode.nic.in) (Section 14 & 19 (Qualifying dates & eligibility))

---

### Assisted Support & Representative Authorization (`assisted_support`)

- **Path:** `/app/assist`
- **Purpose:** Guidance for senior citizens, low-literacy voters, and people with disabilities who require authorized assistance, plus official 1950 helpline directory.
- **Auth Requirement:** ANY
- **Availability:** `fully_implemented` (Provides National Voter Helpline (1950) details and ensures representative actions remain strictly auditable.)
- **Registered Sections:** `helplines-card`, `assisted-agent-form`, `rights-notice`
- **Required Inputs:** Representative Name, Relationship, Phone Number, Explicit Citizen Authorization
- **Highlightable UI Targets (`data-ai-target`):**
  - `assist-rep-name-input`: Representative legal name input (selector: `[data-ai-target="assist-rep-name-input"]`)
  - `assist-auth-checkbox`: Citizen explicit authorization checkbox (selector: `[data-ai-target="assist-auth-checkbox"]`)
  - `assist-submit-btn`: Record authorized representative button (selector: `[data-ai-target="assist-submit-btn"]`)
- **Official References:**
  - [ECI Accessible Elections Guidelines (PwD & Senior Citizens)](https://www.eci.gov.in) 

---

### Periodic Contact Check-in (Voluntary) (`checkin`)

- **Path:** `/app/checkin`
- **Purpose:** Allows registered citizens to voluntarily re-confirm contact preferences and maintain active notification channels.
- **Auth Requirement:** CITIZEN
- **Availability:** `fully_implemented` (Explicit non-retaliation safeguard: Inactivity or non-response NEVER results in adverse determinations or account closure.)
- **Registered Sections:** `checkin-safeguard`, `checkin-action-card`
- **Required Inputs:** Cycle ID
- **Highlightable UI Targets (`data-ai-target`):**
  - `checkin-confirm-btn`: Confirm contact check-in button (selector: `[data-ai-target="checkin-confirm-btn"]`)
- **Official References:**
  - [Digital Personal Data Protection Act 2023](https://www.indiacode.nic.in) 

---

### How VoteRule Works (`how_it_works`)

- **Path:** `/how-it-works`
- **Purpose:** Step-by-step overview of VoteRule’s three-stage civic process: Verify Official Search, Diagnose Statutory Issue, and Prepare Official Form.
- **Auth Requirement:** ANY
- **Availability:** `fully_implemented` (Educational informational page.)
- **Registered Sections:** `stages-grid`, `cta-search`
- **Highlightable UI Targets (`data-ai-target`):**
  - `how-start-search-btn`: Start voter search CTA button (selector: `[data-ai-target="how-start-search-btn"]`)
- **Official References:**
  - [ECI Citizen Services Overview](https://voters.eci.gov.in) 

---

### Verification Methodology & Civic Neutrality (`methodology`)

- **Path:** `/methodology`
- **Purpose:** Detailed explanation of our civic independence, zero-scraping policy, anti-shadow roll commitment, and cryptographic auditability.
- **Auth Requirement:** ANY
- **Availability:** `fully_implemented` (Living document detailing operational boundaries.)
- **Registered Sections:** `neutrality-guarantee`, `data-security`, `audit-chain`
- **Official References:**
  - [ECI Central API & Roll Access Policy](https://www.eci.gov.in) 

---

### Privacy Policy & DPDP Notice (`privacy_policy`)

- **Path:** `/privacy`
- **Purpose:** Comprehensive privacy policy compliant with the Digital Personal Data Protection Act 2023, disclosing encryption, retention, and AI assistant data processing.
- **Auth Requirement:** ANY
- **Availability:** `fully_implemented` (Includes Grievance Redressal Officer contact and right to data erasure.)
- **Registered Sections:** `privacy-notice`, `data-fiduciary`, `ai-voice-processing`, `grievance-officer`
- **Official References:**
  - [Digital Personal Data Protection Act 2023](https://www.indiacode.nic.in) 

---

### Accessibility Statement (WCAG 2.2 AA) (`accessibility`)

- **Path:** `/accessibility`
- **Purpose:** Accessibility commitments, keyboard shortcuts, screen reader compatibility, high-contrast modes, and reduced motion settings.
- **Auth Requirement:** ANY
- **Availability:** `fully_implemented` (Documents compliance with IS 17802 / WCAG 2.2 AA.)
- **Registered Sections:** `accessibility-statement`, `assistive-tech-details`
- **Official References:**
  - [Guidelines for Indian Government Websites (GIGW 3.0)](https://guidelines.india.gov.in) 

---

### Citizen Sign In (`auth_login`)

- **Path:** `/auth`
- **Purpose:** Secure authentication using mobile number or synthetic demo citizen account.
- **Auth Requirement:** ANY
- **Availability:** `fully_implemented` (Provides demo logins in demo mode and password hashing with HMAC blind indexing.)
- **Registered Sections:** `login-form`, `demo-accounts`
- **Required Inputs:** Identifier / Phone, Password or OTP
- **Highlightable UI Targets (`data-ai-target`):**
  - `auth-email-input`: Identifier/Email input field (selector: `[data-ai-target="auth-email-input"]`)
  - `auth-password-input`: Password input field (selector: `[data-ai-target="auth-password-input"]`)
  - `auth-submit-btn`: Sign In button (selector: `[data-ai-target="auth-submit-btn"]`)
  - `auth-demo-aarav-btn`: Demo Quick Login (Aarav Sharma) (selector: `[data-ai-target="auth-demo-aarav-btn"]`)

---

