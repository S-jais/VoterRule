# ADR-001: Architecture Decision Record — VoteRule AI Civic Assistant

**Status:** Accepted  
**Date:** 2026-11-01  
**Author:** AI Product Architect & Security Engineer  
**Scope:** `apps/api`, `apps/web`, `packages/shared`, `packages/guidance`  

---

## 1. Context & Objectives

VoteRule is an independent, non-partisan civic-assistance web application helping eligible Indian citizens check their electoral-roll status, navigate registration issues, and prepare statutory applications (Forms 6, 6A, 6B, 7, and 8). To make electoral information intuitive and accessible—especially for citizens with low technical literacy or visual/reading barriers—we are introducing **VoteRule AI**, a voice-enabled, navigation-capable digital assistant embedded directly inside VoteRule.

The assistant must satisfy strict operational principles:
- **Independence:** Never impersonate ECI, EROs, or government officials.
- **No Determinations:** Never decide voter eligibility or brand entries as fraudulent or illegal.
- **Neutrality:** Zero party/candidate bias or political steering.
- **Privacy & Controlled Actions:** No arbitrary DOM access or raw JS execution; all navigation and actions run through a strictly guarded allowlist.
- **Graceful Degradation:** The platform must work seamlessly offline or in demo mode without mandatory third-party subscriptions.

---

## 2. Decision Summary

| Capability | Primary / Cloud Option | Offline / Default Fallback | Rationale |
|---|---|---|---|
| **LLM Orchestration** | Google Gemini (Gemini 1.5/2.0 Flash) or OpenAI-compatible | High-Fidelity Statutory Rules Engine & RAG Retriever | Fast latency, strong multilingual support for Indian languages (Hindi, Hinglish), cheap token cost. Rule engine guarantees 100% testable, zero-cloud execution out of the box. |
| **Speech-To-Text (STT)** | Cloud STT API (Google Cloud Speech / Whisper API) | Browser Web Speech API (`webkitSpeechRecognition`) | Free, zero-latency client capture with instant streaming transcripts. Cloud STT option available via server proxy for browsers lacking native Web Speech API. |
| **Text-To-Speech (TTS)** | Cloud Neural Voices (Google Cloud TTS / Azure Neural) | Browser Web SpeechSynthesis (`window.speechSynthesis`) | Browser synthesis requires zero bandwidth or secrets. Cloud TTS produces natural Indian accents (`en-IN`, `hi-IN`). |
| **Knowledge Retrieval (RAG)** | Hybrid BM25 Keyword + Vector Embeddings | In-Memory Term Frequency BM25 with exact-match boost | Electoral law and form codes require exact statutory terminology matching (e.g. "Form 6", "Article 326", "EPIC"). Pure vector search often hallucinates form numbers. BM25 guarantees precision. |
| **Session & Memory Store** | Redis (Production) | In-Memory TTL Session Map with Sliding Window | Strict session isolation per user ID / anonymous session ID. No cross-user leakage. 30-minute expiry with automatic redaction of PII (EPIC, Aadhaar, phones). |

---

## 3. Detailed Component Architecture

### 3.1 Pluggable Provider Interfaces
All external dependencies are decoupled behind strict TypeScript interfaces in `apps/api/src/ai/interfaces.ts`:
- `LLMProvider`: `chat(messages: ChatMessage[], options: LLMOptions): Promise<LLMResponse>`
- `SpeechToTextProvider`: `transcribe(audioBuffer: Buffer, locale: string): Promise<STTResult>`
- `TextToSpeechProvider`: `synthesize(text: string, locale: string): Promise<TTSResult>`
- `KnowledgeRetriever`: `search(query: string, category?: string, limit?: number): Promise<RetrievedChunk[]>`
- `SessionStore`: `get(sessionId: string): Promise<ChatSession>`, `save(session: ChatSession): Promise<void>`, `clear(sessionId: string): Promise<void>`

### 3.2 Knowledge Base Architecture (Two Corpora)
1. **App Corpus:** Generated automatically from `scripts/gen-app-map.ts` and `app-knowledge.generated.json`. Contains every route, required inputs, section IDs, highlightable UI target IDs, and verified feature availability status.
2. **Official Electoral Corpus:** Curated statutory materials from official authorities:
   - Articles 324, 325, and 326 of the Constitution of India.
   - Representation of the People Act 1950 (Sections 14, 15, 16, 17, 18, 19, 20).
   - Registration of Electors Rules 1960 (Statutory Forms 6, 6A, 6B, 7, 8).
   - ECI Special Summary Revision (SSR) guidelines & qualifying dates.
   - Every claim is backed by a verified `sourceUrl` and `lastVerifiedDate`.

### 3.3 Voice State Machine & Interaction Design
The client implements an explicit finite state machine:
```
           ┌──────────┐
    ┌─────►│   IDLE   │◄────────────────┐
    │      └────┬─────┘                 │
    │           │ (User mic tap)        │
    │           ▼                       │
    │      ┌──────────┐                 │
    │      │LISTENING │                 │
    │      └────┬─────┘                 │
    │           │ (Silence / manual stop)
    │           ▼                       │
    │      ┌──────────┐                 │
    │      │PROCESSING│                 │
    │      └────┬─────┘                 │
    │           │ (Server stream ready) │
    │           ▼                       │
    │      ┌──────────┐                 │
    │      │RESPONDING│                 │
    │      └────┬─────┘                 │
    │           │ (Speech playback)     │
    │           ▼                       │
    │      ┌──────────┐                 │
    └──────┤ SPEAKING ├─────────────────┘
           └──────────┘  (Barge-in / Stop / Done)
```
- **Barge-in:** Clicking the microphone or speaking while the assistant is in `SPEAKING` state immediately terminates speech synthesis and shifts the state to `LISTENING`.
- **Voice Brevity:** The API emits two text payloads:
  - `displayText`: Markdown text with structured lists, caveats, and official citation source chips.
  - `spokenText`: Short, clear, conversational sentences without markdown formatting, parentheticals, or raw URLs.

### 3.4 Controlled Tool & Action Layer
The model cannot execute raw client code. It outputs structured intent actions that are validated server-side and executed by the client's `ActionExecutor`:
- `navigateTo(routeId)`: Checked against allowlisted route IDs in `app-knowledge.generated.json`.
- `scrollToSection(sectionId)`: Validated for the active route.
- `highlightElement(elementId)`: Emits temporary accessible pulse and tooltip on allowlisted `[data-ai-target]` elements.
- `openOfficialSource(sourceId)`: Offers verified official ECI / India Code links opening in a new tab with `rel="noopener noreferrer"`.
- `startGuidedWorkflow(workflowId)`: Initiates multi-step guided workflows (e.g. Missing Name Assistance).

### 3.5 Security, Safety & Privacy Guardrails
1. **Redaction of Identifiers:** All EPIC numbers (e.g. `ABC1234567`), phone numbers, and 12-digit patterns are redacted before being sent to external model providers or stored in logs.
2. **Audit Logging:** Every AI request, intent, tool invocation, and outcome is recorded in VoteRule's append-only cryptographic audit chain.
3. **No Unprompted Microphone Access:** Audio capture requires an explicit user click; microphone indicators are persistently visible.
4. **Prompt Injection Resistance:** System prompts enforce strict separation between instructions and untrusted user/retrieved content.

---

## 4. Consequences & Verification

- **Positive:**
  - 100% reproducible test suite that runs offline without paid cloud API accounts.
  - Full adherence to DPDP Act 2023, WCAG 2.2 AA accessibility, and ECI neutrality standards.
  - Consistent design tokens and typography matching the VoteRule design system.
- **Verification Plan:**
  - Golden test suite covering all 14 intents.
  - Automated red-team penetration tests against prompt injection and cross-user data leakage.
  - Voice state machine unit tests covering barge-in, timeouts, and error recoveries.
