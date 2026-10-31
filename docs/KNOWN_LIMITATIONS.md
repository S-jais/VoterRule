# Known Limitations & Honest Disclosure

> **Guiding Principle (§0):** Never invent official API endpoints, ECI responses, voter records, official confirmation numbers, legal rules, deadlines, form numbers or statistics. If something cannot work, label it honestly as unavailable and explain the alternative.

---

## 1. Statutory API Gateway & Real-Time Electoral Roll Verification

* **Limitation:** Matdata Setu does not possess an active bilateral MoU or direct private API interconnect with the Election Commission of India's central ERONet system.
* **Why:** The Representation of the People Act, 1950 and the Registration of Electors Rules, 1960 place custody of the electoral rolls exclusively with designated statutory officers (Electoral Registration Officers). Direct machine-to-machine API access is not open to public or private third parties without formal authorization.
* **Working Alternative:** The portal implements the **Guided Manual Verification** workflow. It dynamically generates deep links to the official ECI search interface (`voters.eci.gov.in`), assists the elector in formulating the search parameters, and records the verified citizen-observed outcome with an immutable timestamp and provenance chip.
* **Integrity Guard:** The platform strictly prohibits web scraping, automated CAPTCHA bypassing, or reverse-engineering of official portals.

---

## 2. Telecommunication & SMS Delivery in Demo Mode

* **Limitation:** In `APP_MODE=demo`, live SMS text messages are not transmitted over cellular networks.
* **Why:** Production SMS delivery requires TRAI DLT registration, approved Transactional Header IDs (e.g., `VM-MSETU`), and registered SMS templates pursuant to the Telecom Commercial Communications Customer Preference Regulations, 2018.
* **Working Alternative:** In demo mode, SMS OTPs are fixed to `123456` or logged directly to the server terminal output for immediate verification during demonstrations.

---

## 3. Statutory Revision Schedules & Assembly Gazette Timing

* **Limitation:** State-specific Special Summary Revision (SSR) and continuous updation timelines vary dynamically across India's 28 States and 8 Union Territories based on election cycles and Delimitation orders.
* **Seed Status:** The statutory seeds included in `packages/guidance` reflect official schedules published as of October 2026.
* **Mitigation:** The rules engine supports dynamic runtime versioning. When new ECI notifications are released, administrators can upload a new rules manifest without altering application code. Unverified or transitional schedules are explicitly badged in the UI as *"Tentative / Subject to Official ERO Gazette"*.

---

## 4. Multi-State Cross-Matching & Voter Mobility

* **Limitation:** An independent civic platform cannot authoritatively detect whether an individual is registered across multiple distant assembly constituencies without bulk access to the national roll.
* **Why:** Bulk roll harvesting is a strict non-goal (§3) and unlawful under privacy and electoral regulations.
* **Working Alternative:** The portal provides the **Self-Reported Relocation & Multiple Entry Review** tool. Electors who moved residences can prepare Form 8 (shifting of residence) or Form 7 (surrender of previous registration) to proactively ensure constitutional compliance with Section 17 of the Representation of the People Act, 1950 (*No person to be registered in more than one constituency*).

---

## 5. Deliberate Architectural Exclusions (Non-Goals)

1. **No Automated Face Recognition or Biometrics:** Excluded by architectural design to safeguard citizen privacy.
2. **No Public Shaming or "Ghost Voter" Lists:** All third-party reports are private, capped at 3 per account per month, and subjected to a 4-eyes reviewer approval process before any recommendation is made.
3. **No Automatic Account Creation for Minors (<18):** Minors receive 100% stateless, zero-data-stored guidance to comply with Section 9 of the DPDP Act.
