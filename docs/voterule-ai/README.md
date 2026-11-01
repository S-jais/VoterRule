# VoteRule AI: Architecture, Operations & Extension Guide

VoteRule AI is an independent, voice-enabled, navigation-capable digital civic assistant embedded within the **VoteRule** platform. It assists Indian citizens in understanding electoral registration procedures, resolving roll discrepancies, and navigating statutory forms (Forms 6, 6A, 6B, 7, 8) under the **Representation of the People Act 1950 & 1951** and **Article 326 of the Constitution of India**.

---

## 1. Core Principles & Safeguards

VoteRule AI is governed by strict ethical, legal, and security guardrails:

1. **Independence:** VoteRule is an independent civic-technology initiative. VoteRule AI **never** presents itself as an Election Commission of India (ECI) official, Electoral Registration Officer (ERO), Booth Level Officer (BLO), or government authority. Official decisions rest strictly with competent statutory bodies.
2. **Zero Fabrication:** The assistant never invents sections of law, form numbers, deadlines, fees, helpline numbers (official: `1950`), or portal URLs. If a question is outside the verified knowledge base, it transparently admits so and provides official portals (`https://voters.eci.gov.in`).
3. **No Final Determinations:** The assistant never declares whether an elector is legally eligible or ineligible, whether a deletion is fraudulent, or whether two records represent the exact same person. It diagnoses conditions and prepares statutory guidance.
4. **Strict Political Neutrality:** Zero promotion or criticism of any party, candidate, or political alliance. No voting persuasion or preference elicitation. Allegations and controversies are strictly distinguished from verified statutory findings.
5. **Controlled Client Actions:** The LLM has zero raw DOM access, arbitrary URL execution, or administrative database rights. It interacts with the client strictly through four allowlisted, validated actions (`navigate_to`, `scroll_to_section`, `highlight_element`, `open_official_source`).
6. **PII Masking & DPDP Act 2023:** All incoming prompts undergo automatic redaction of EPIC voter IDs (`[REDACTED_EPIC_ID]`), 12-digit Aadhaar patterns (`[REDACTED_AADHAAR_PATTERN]`), phone numbers (`[REDACTED_PHONE]`), and email addresses before reaching LLM context or logs.
7. **Tamper-Evident SHA-256 Audit Chain:** Every interaction and tool execution is recorded into VoteRule's cryptographic audit ledger.

---

## 2. Architecture & Data Flow

### 2.1 End-to-End Voice & Conversation Flow

```
[ Citizen User ]
       │
       ▼ (Explicit Tap on Floating Mic / Launcher)
[ Web Speech API (STT) ] ── (Real-time Speech Recognition: en-IN / hi-IN)
       │
       ▼ (Barge-in: cancels active speech immediately)
[ AssistantPanel / VoiceController ]
       │
       ▼ (POST /api/ai/chat with Session ID, Message, Locale)
[ Fastify AI Subsystem (/apps/api) ]
   ├── Rate Limiting & Auth Policy Check
   ├── PII Redactor (EPIC, Aadhaar, Phone, Email)
   ├── Language Detector (en / hi / hinglish)
   ├── Intent Classifier (14 statutory intents)
   ├── Multi-Corpus Knowledge Retriever
   │     ├── App Knowledge (app-knowledge.generated.json)
   │     └── Electoral Knowledge Base (electoral-seeds.ts)
   ├── Orchestrator Engine (Rule-based or Gemini 1.5 Flash)
   └── Tool Execution & Route Policy Gate
       │
       ▼ (Dual Payload: displayText with Markdown + spokenText in plain voice prose)
[ Client ActionExecutor & SpeechSynthesis (TTS) ]
   ├── Execute UI Navigation / Element Highlighting / Scroll
   └── Vocalize spokenText through Ashoka Chakra / Tricolor Waveform Visualizer
```

---

## 3. Controlled Action Execution Layer

The assistant can recommend and trigger client-side actions. These are executed strictly by `ActionExecutor` on the web client:

| Action Type | Allowed Targets / Rules | Security Gate |
| :--- | :--- | :--- |
| `navigate_to` | Allowlist: `home`, `check_voter_status`, `missing_name_assistance`, `duplicate_self_check`, `deceased_person_report`, `dashboard`, `eligibility_check`, `how_it_works`, `methodology`, `privacy_policy`, `accessibility`, `auth_login` | Unrecognized route IDs are rejected and logged. |
| `scroll_to_section` | Registered DOM element IDs (`#how-it-works`, `#quick-actions`, `#ssr-deadlines`, etc.) | Graceful fallback if ID not found in current view. |
| `highlight_element` | Allowlisted `[data-ai-target="..."]` elements: `home-check-btn`, `home-missing-btn`, `home-duplicate-btn`, `home-deceased-btn`, `home-eligibility-btn`, `duplicate-name-input`, `duplicate-state-select`, `duplicate-submit-btn`, `deceased-name-input`, `deceased-basis-select`, `deceased-submit-btn`, `eligibility-eval-btn`, `dashboard-new-check-btn`, `dashboard-active-case-card` | Automatically pulses with accessible focus ring and removes after 4 seconds. |
| `open_official_source` | Strict domain allowlist: `https://voters.eci.gov.in`, `https://electoralsearch.eci.gov.in`, `https://www.eci.gov.in`, `https://www.indiacode.nic.in` | Any other external URL or javascript: scheme is blocked. |

---

## 4. Environment Variables & Provider Configuration

All sensitive secrets remain strictly server-side. The assistant functions with 100% offline rule-based deterministic fallbacks when credentials are not supplied.

| Environment Variable | Description | Default / Fallback |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API Key (e.g. for Gemini 1.5 Flash). | If empty/omitted, orchestrator uses deterministic `RuleBasedProvider`. |
| `GEMINI_MODEL` | Gemini Model Identifier. | `gemini-1.5-flash` |
| `STT_API_KEY` | Server-side Speech-to-Text provider key (swappable interface). | Browser Web Speech API (`SpeechRecognition`) is primary client-side engine. |
| `TTS_API_KEY` | Server-side Text-to-Speech provider key (swappable interface). | Browser Web Speech Synthesis (`SpeechSynthesisUtterance`) is primary client-side engine. |
| `AI_SESSION_TTL_MINUTES` | In-memory session store expiry window. | `60` minutes |
| `AI_MAX_TURNS_PER_SESSION`| Context history ceiling before sliding-window pruning. | `20` turns |

---

## 5. Knowledge Base Operations

VoteRule AI maintains two separate knowledge corpora:

### 5.1 App Knowledge Map (`apps/api/src/ai/knowledge/app-knowledge.generated.json`)
The application knowledge map is generated directly from source code and routing definitions to guarantee that the AI never describes stale, missing, or mocked features as real:

- **Generate App Map:**
  ```bash
  pnpm run ai:gen-app-map
  ```
  Generates `docs/voterule-ai/APP_MAP.md` and `apps/api/src/ai/knowledge/app-knowledge.generated.json`.

- **CI Staleness Verification:**
  ```bash
  pnpm run ai:check-app-map
  ```
  Fails build if the generated JSON is missing or out of sync with the registered routes.

### 5.2 Statutory Electoral Knowledge Corpus (`apps/api/src/ai/knowledge/electoral-seeds.ts`)
Official statutory entries are curated with explicit official citations and verification timestamps:
- **Articles 324, 325, 326** of the Constitution of India.
- **Representation of the People Act 1950** (Sections 14, 16, 17, 18, 19, 20, 21, 22, 23).
- **Representation of the People Act 1951** (Sections 62, 134).
- **Statutory Forms:** Form 6 (New inclusion), Form 6A (Overseas electors), Form 6B (Voluntary Aadhaar authentication), Form 7 (Objection / deletion / death), Form 8 (Correction / address shifting within or outside AC).
- **ECI Revision Cycles:** 4 statutory qualifying dates (1 January, 1 April, 1 July, 1 October).
- **National Voter Helpline:** Toll-free `1950`.

---

## 6. How to Extend VoteRule AI

### 6.1 Adding a New Indian Language
VoteRule AI is designed with an extensible locale registry:
1. **Locale Definitions:** Add the locale code (e.g., `bn-IN`, `ta-IN`, `te-IN`, `mr-IN`) to `VoiceController.ts` mapping and `LanguageSelector.tsx`.
2. **UI Translations:** Add the translated strings to `@voterrule/i18n` under `packages/i18n/src/locales/`.
3. **Knowledge Tags:** Add bilingual seeds with `language: '<code'>` into `apps/api/src/ai/knowledge/electoral-seeds.ts`.
4. **Prompt Rules:** Update `prompts/voterule-ai.system.md` to declare language guidelines for the new locale.

### 6.2 Adding a New Route or Action Target
1. Register the route and its `highlightableElementIds` in `scripts/gen-app-map.ts`.
2. Add corresponding `data-ai-target="your-target-id"` in the page component.
3. Update `ROUTE_PATH_MAP` in `apps/web/src/components/ai/ActionExecutor.ts`.
4. Re-run `pnpm run ai:gen-app-map` and `pnpm run ai:check-app-map`.

### 6.3 Adding a Guided Workflow
Guided workflows assist users through multi-step civic processes (e.g. `MISSING_NAME_WIZARD`, `OVERSEAS_ELECTOR_GUIDANCE`):
1. Define workflow steps and questions in `apps/api/src/ai/workflows/definitions.ts`.
2. Register the workflow in `WorkflowEngine` (`apps/api/src/ai/workflows/workflow-engine.ts`).
3. Add intent mapping in `IntentClassifier` (`apps/api/src/ai/intent/classifier.ts`).

---

## 7. Pre-Launch Checklist & Items Requiring Human Review

The following items should undergo expert human review prior to production release:

1. **Native Legal Translation Review:** Hindi (`hi-IN`) and Hinglish responses should be reviewed by legal and election-procedure translators to ensure statutory terms (e.g. *निर्वाचक रजिस्ट्रीकरण अधिकारी*, *दावे और आपत्तियां*, *पात्रता तिथि*) match official Hindi ECI gazettes.
2. **DPDP Act 2023 Compliance Review:** Verification by the designated Data Protection Officer (DPO) that PII masking matches state and national guidelines.
3. **Official Electoral Revision Schedules:** Annual verification of state-specific SSR dates against published ECI gazette notifications.
4. **Gemini API Production Quota & Monitoring:** For live deployments using Google Gemini 1.5 Flash, set up API keys with rate limits and billing alerts in Google Cloud Console.

---

*VoteRule AI — Your Digital Civic Assistant.*  
*Understand Your Vote. Know Your Rights.*

