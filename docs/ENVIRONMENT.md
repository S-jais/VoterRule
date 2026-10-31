# Environment Variables & Configuration Specification

> **Configuration File:** `.env` (scaffolded from `.env.example`)  
> **Fail-Closed Principle:** In `APP_MODE=production`, the application refuses to start if any security-critical variable is missing, uses default mock values, or falls below minimum cryptographic entropy requirements.

---

## 1. Application Mode & Core Runtime

| Variable | Type | Allowed Values | Default | Purpose |
|:---|:---:|:---:|:---:|:---|
| `APP_MODE` | String | `demo` \| `production` | `demo` | Core mode switch. In `demo`, uses embedded SQLite/in-memory storage and pre-seeded mock cases. In `production`, requires full PostgreSQL, KMS, and MinIO storage. |
| `NODE_ENV` | String | `development` \| `production` \| `test` | `development` | Node.js process optimization and logger level. |
| `PORT` | Integer | `1` - `65535` | `4000` | Port on which the Fastify API server listens. |
| `CORS_ORIGINS` | String | Comma-delimited URLs | `http://localhost:3000,http://localhost:4001` | Allowed origin headers for citizen (`web`) and staff (`admin`) apps. |

---

## 2. Cryptographic Secrets (Mandatory in Production)

| Variable | Format | Minimum Entropy | Purpose |
|:---|:---:|:---:|:---|
| `ENCRYPTION_MASTER_KEY` | Hex String | 64 hex chars (32 bytes) | Root Key Encryption Key (KEK) used to wrap individual Data Encryption Keys (DEKs) for AES-256-GCM envelope encryption. |
| `BLIND_INDEX_SALT` | Hex String | 64 hex chars (32 bytes) | Salt for HMAC-SHA256 blind indexing of names and phone numbers to allow exact search without decrypting database columns. |
| `MATCH_TOKEN_SECRET` | Hex String | 64 hex chars (32 bytes) | Independent secret used to derive irreversible matching tokens for duplicate candidate identification. |
| `JWT_SECRET` | Hex String | 64 hex chars (32 bytes) | HMAC-SHA256 signing secret for short-lived (15 min) JWT access tokens. |

*Generation Helper:*
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 3. Database & Object Storage

| Variable | Format | Example | Purpose |
|:---|:---:|:---|:---|
| `DATABASE_URL` | URI | `postgresql://user:pass@host:5432/matdata_setu?sslmode=require` | PostgreSQL 15+ database connection string with SSL. |
| `S3_ENDPOINT` | Hostname/IP | `minio:9000` or `s3.ap-south-1.amazonaws.com` | S3-compatible private object storage endpoint. |
| `S3_BUCKET` | String | `matdata-setu-proofs` | Dedicated bucket for encrypted citizen upload proofs. |
| `S3_ACCESS_KEY` | String | `minioadmin` | S3 API Access Key ID. |
| `S3_SECRET_KEY` | String | `minioadmin` | S3 API Secret Access Key. |
| `S3_USE_SSL` | Boolean | `true` \| `false` | Enables HTTPS/TLS for object storage transactions. |

---

## 4. Antivirus & Malware Defense

| Variable | Format | Example | Purpose |
|:---|:---:|:---|:---|
| `CLAMAV_HOST` | Hostname/IP | `clamav` or `127.0.0.1` | Host running the ClamAV daemon (`clamd`). |
| `CLAMAV_PORT` | Integer | `3310` | Port for ClamAV streaming protocol (`INSTREAM`). |

---

## 5. Electoral Roll Integration (Optional / Fallback)

| Variable | Format | Example | Purpose |
|:---|:---:|:---|:---|
| `OFFICIAL_ROLL_API_ENABLED` | Boolean | `false` \| `true` | When `false`, automatically engages the `GuidedManualProvider`. |
| `OFFICIAL_ROLL_API_URL` | URL | `https://api.voters.eci.gov.in/v1/search` | Statutory authorized API gateway endpoint. |
| `OFFICIAL_ROLL_API_KEY` | String | `sec_prod_live_xxxxxxxx` | Authenticated client credential issued by competent authorities. |

---

## 6. Frontend Configuration

| Variable | Application | Example | Purpose |
|:---|:---:|:---|:---|
| `VITE_API_URL` | `apps/web` & `apps/admin` | `http://localhost:4000` | Ingress API endpoint referenced by the client bundles. |
| `VITE_APP_MODE` | `apps/web` & `apps/admin` | `demo` \| `production` | Controls display of demo banners and synthetic data chips. |
