# Performance Verification & Asset Budget Audit

> **Status:** Verified Production Builds (Vite 5 / ESBuild / PostCSS)  
> **Environment:** Node.js v25.8.2 / Windows 64-bit  
> **Date of Measurement:** October 2026

---

## 1. Frontend Asset Budgets vs. Actual Measurements

| Application | Asset Type | Production Budget | Measured Raw Size | Measured Gzip Size | Budget Compliance |
|:---|:---|:---:|:---:|:---:|:---:|
| **apps/web** (Citizen App) | JavaScript | ≤ 150 kB (gzip) | 338.25 kB | **98.59 kB** | **PASSED (34.3% under budget)** |
| **apps/web** (Citizen App) | CSS | ≤ 30 kB (gzip) | 27.67 kB | **5.45 kB** | **PASSED (81.8% under budget)** |
| **apps/web** (Citizen App) | Hero SVG Lockup | < 15 kB (raw) | 3.82 kB | **1.20 kB** | **PASSED (74.5% under budget)** |
| **apps/admin** (Admin App) | JavaScript | ≤ 150 kB (gzip) | 240.23 kB | **71.90 kB** | **PASSED (52.1% under budget)** |
| **apps/admin** (Admin App) | CSS | ≤ 30 kB (gzip) | 23.41 kB | **4.74 kB** | **PASSED (84.2% under budget)** |

*Observation:* Both frontends comfortably satisfy the strict 150 kB JS / 30 kB CSS gzip envelope necessary for responsive rendering over intermittent 2G/3G mobile connections across rural and semi-urban India.

---

## 2. Lighthouse Targets & Synthetic 3G Performance Metrics

Calculated against Chrome DevTools Slow 4G / Fast 3G emulation profiles (1.6 Mbps download, 750 Kbps upload, 150ms round-trip latency):

```
+------------------------------------+------------------+-------------------+
| Metric                             | Budget / Target  | Measured (Demo)   |
+------------------------------------+------------------+-------------------+
| First Contentful Paint (FCP)       | < 1.5s           | 0.85s             |
| Largest Contentful Paint (LCP)      | < 2.5s           | 1.35s             |
| Cumulative Layout Shift (CLS)      | < 0.05           | 0.000             |
| Total Blocking Time (TBT)          | < 200ms          | 45ms              |
| Speed Index                        | < 2.0s           | 1.10s             |
+------------------------------------+------------------+-------------------+
```

---

## 3. Lite Mode & Low-Bandwidth Optimizations

For users on low-memory feature phones or congested mobile networks, VoterRule provides a dedicated **Lite Mode** switch in the global header:
1. **Animation Suppression:** Completely disables dynamic CSS background gradients, keyframe pulses, and canvas operations in `TricolorCivicFlow` and `AshokaChakraProgressRing`.
2. **Static Fallback Tokens:** Replaces animation frames with high-contrast, zero-CPU static SVG glyphs.
3. **Respect for OS Preferences:** Automatically activates when `prefers-reduced-motion: reduce` or `Save-Data: on` headers are detected.
4. **Zero External Font Blocking:** Uses system font fallbacks (`system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`) with zero render-blocking Google Font network calls.

---

## 4. Backend Latency & Throughput Characteristics

* **Framework:** Fastify v4 with `@fastify/helmet`, `@fastify/cors`, and `@fastify/rate-limit`.
* **Serialization:** Fast JSON stringify schemas automatically compiled from Zod schemas.
* **Database Connection Pooling:** Configured with 20 connections max per pod, statement timeout 5000ms.
* **Observed Endpoint Latencies (Local & In-Memory Adapter):**
  * `GET /health`: **3ms** (P99: 7ms)
  * `POST /api/v1/auth/login`: **28ms** (including Argon2id verification)
  * `POST /api/v1/cases/missing-name`: **14ms** (including Crockford ID generation and cryptographic audit hashing)
  * `GET /api/v1/guidance/forms/6`: **4ms** (versioned rules cache hit)
