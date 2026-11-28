# Stage 2 Technical Requirements Document (TRD) & Architecture

## 1. Architecture Overview
ABM Sphere uses a **modular monolith** served by a lightweight Node.js HTTP server (`server.js`):
- **Presentation & Client Engine (`index.html`)**: Responsive, themeable SPA (Dark, Light, Purple, Blue themes) with 4 hexagonal HUD canvas backgrounds, SheetJS (`.xlsx`/`.xls`/`.csv`), Mammoth (`.docx` parsing), JSZip (`.docx` & synced pair export), and Canvas Confetti.
- **Server & API Layer (`server.js`)**:
  - Serves static assets with strict path-traversal protection and `Cache-Control` policies.
  - Applies security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`).
  - Exposes REST JSON endpoints under `/api/*` with per-IP rate limiting (`RATE_LIMIT_MAX`), body size caps (`MAX_BODY_BYTES`), and input sanitization.
- **Browser Extension Bridge (`extensions/ABM_Sphere_CMS_Bridge_v4_2_0.zip`)**:
  - Packaged zip downloadable directly from the Settings modal (with embedded base64 fallback).

## 2. Environments & Configuration
Configuration is driven by environment variables (see `.env.example`):
- `PORT` (default `8080`)
- `HOST` (default `0.0.0.0`)
- `RATE_LIMIT_WINDOW_MS` (default `60000`)
- `RATE_LIMIT_MAX` (default `120`)
- `MAX_BODY_BYTES` (default `65536`)
- `AUDIT_MAX_ENTRIES` (default `500`)

## 3. Data & Retention Model
- **Client Session Data** (Excel buffers, `.docx` articles, queues, SHA-256 seals): Held strictly in JS memory (`state`) and wiped immediately on Logout, Finish Session, `pagehide`, and `beforeunload`.
- **User Preferences** (Theme, custom avatar selection, user registry): Stored locally in `localStorage` under explicit `abm_*` keys.
- **Server Audit Events** (`GET/POST /api/audit`): Bounded in-memory ring buffer (`AUDIT_MAX_ENTRIES`, default 500) storing non-sensitive operational telemetry (`id`, `timestamp`, `actor`, `action`, `status`, `detail`). Passwords and document contents are never logged.

## 4. API Specification
| Endpoint | Method | Purpose | Request / Validation | Response |
|---|---|---|---|---|
| `/api/health` | `GET` | Liveness & asset readiness check | None | `200` JSON with `status`, `uptimeSeconds`, `checks` |
| `/api/docs` | `GET` | Lists available Markdown docs in `/docs` | None | `200` JSON array of `{ name, url }` |
| `/api/audit` | `GET` | Returns up to 50 most recent audit events | None | `200` JSON `{ count, events }` |
| `/api/audit` | `POST` | Records a sanitized audit event | JSON `{ actor, action, status?, detail? }`; `400` if missing required fields; `413` if oversized | `201` JSON `{ ok: true, entry }` |
