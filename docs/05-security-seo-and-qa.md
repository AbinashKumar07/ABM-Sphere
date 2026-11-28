# Security, SEO, Operations & QA Runbook

## 1. Security & Privacy Controls
- **HTTP Security Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy`, and `Content-Security-Policy` enforced by `server.js`.
- **Path Traversal & Internal File Protection**: `server.js` blocks `..` traversal, dotfiles (`.env*`), `server.js`, `package.json`, and `tests/`.
- **Session Hygiene**: Uploaded files, extracted articles, queues, and credentials reside in memory only during a session and are cleared on Finish Session, Logout, `pagehide`, and `beforeunload`.
- **Production HTTPS Note**: On localhost, HTTP is used for local development; any production deployment must sit behind a TLS/HTTPS reverse proxy with HTTP->HTTPS redirect enabled.

## 2. SEO / AIO / GEO Foundation
- `<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph (`og:*`) metadata, and JSON-LD `WebApplication` schema in `index.html`.
- `robots.txt` (disallowing `/api/`) and `sitemap.xml` served at root.
- Custom `404.html` served with HTTP `404` status for missing routes.

## 3. Operations, Backup & Rollback
- **Start**: `npm start` (or `node server.js`).
- **Health Check**: `GET http://localhost:8080/api/health`.
- **Backup**: Back up `index.html`, `server.js`, `avatars/`, `extensions/`, and `docs/`.
- **Rollback**: Restore the previous git commit (`git checkout <commit>`) and restart `node server.js`.

## 4. QA Test Suite
- `npm test` (`tests/foundation.test.js`): Verifies `/`, `/api/health`, `/api/audit` validation & persistence, `/api/docs`, `/robots.txt`, `/sitemap.xml`, `/404.html` (`404` status), security headers, and accessibility landmarks.
- `verify.js`: Verifies JS syntax compilation, zero stale references, DOM ID integrity, SHA-256 sync authentication, permission toggles, and session cleanup.
