# ABM Sphere — Universal Website Foundation Handover

ABM Sphere is a local-first editorial workflow application for **Content Matrix** (`.xlsx` + `.docx` 1-to-1 authenticated sync) and **URL Matrix** management, featuring an Admin Console, Split-Screen Review Viewer, Chrome Extension CMS Bridge integration, and 4 live hexagonal HUD background engines.

## Folder Structure
```text
ABM-Sphere-main/
├── index.html                          # Main application SPA
├── server.js                           # Modular Node.js HTTP server, security headers & /api/*
├── package.json                        # Scripts & Node engine metadata
├── .env.example                        # Environment variable template
├── 404.html                            # Custom accessible 404 recovery page
├── robots.txt                          # Crawler directives
├── sitemap.xml                         # XML sitemap
├── avatars/                            # Profile avatar PNGs (Abinash, Admin, Muskan, Nikita, Utsav)
├── extensions/
│   └── ABM_Sphere_CMS_Bridge_v4_2_0.zip # Chrome extension bundle
├── docs/                               # Stage 1, 2 & 10 Foundation Documentation
│   ├── 01-discovery-and-prd.md
│   ├── 02-trd-and-architecture.md
│   ├── 03-ia-and-app-flows.md
│   ├── 04-ui-ux-and-accessibility.md
│   ├── 05-security-seo-and-qa.md
│   └── 06-addon-template-and-checklist.md
└── tests/
    └── foundation.test.js              # Automated HTTP, API, security, SEO & 404 integration tests
```

## Quick Start (Localhost)
1. Ensure **Node.js >= 18** is installed.
2. Start the server:
   ```bash
   npm start
   ```
3. Open `http://localhost:8080` in your browser.

## API Endpoints
- `GET /api/health` — Service status, uptime, and asset readiness checks.
- `GET /api/docs` — Index of documentation files in `/docs`.
- `GET /api/audit` — Recent operational audit events (bounded in-memory ring buffer).
- `POST /api/audit` — Record an operational audit event (`{ actor, action, status?, detail? }`).

## Running Tests
```bash
npm test
```

## Known Limitations
- Localhost runs over HTTP; deploy behind a TLS/HTTPS reverse proxy before exposing on a network.
- Server audit logs (`/api/audit`) are stored in memory and reset when `server.js` restarts; client uploaded files and queues are intentionally memory-only and wiped when a session ends.
- CDN libraries (`xlsx`, `jszip`, `mammoth`, `canvas-confetti`) require internet access on first load (a retry banner is shown if offline).
