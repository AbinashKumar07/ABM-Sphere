# Stage 1 Discovery & Product Requirements Document (PRD) — ABM Sphere

## 1. Discovery & Product Definition
- **Product Name**: ABM Sphere (`ABM Immersive Content Manager & URL Matrix`)
- **Purpose**: Internal editorial workflow and matrix synchronization workspace for uploading, validating, authenticating, reviewing, and pushing structured Content Matrix and URL Matrix batches into MoMAGIC CMS (`content.thefactmagic.com`).
- **Primary Conversion / Outcome**: Authenticated 1-to-1 pair synchronization (`.xlsx` + `.docx` with identical case-sensitive filenames and verified keyword/topic content alignment), editorial review completion, and 1-click CMS autofill via the ABM Sphere CMS Bridge extension, followed by clean session wipe on finish.
- **Target Users**:
  - **Editors / Users**: Upload matrices, review articles/URLs, edit fields, send to CMS, and export updated `.xlsx`/`.docx` pairs.
  - **Admins**: Manage user accounts, role permissions (`Upload & Sync`, `Admin Override`, `Export Synced Files`), review batch authentication audit logs, and access the Admin Console.
- **Confirmed Constraints & Scope**:
  - Memory-only session lifecycle for uploaded files, queues, and credentials; automatic wipe on Finish Session, Logout, `pagehide`, and `beforeunload`.
  - Compulsory exact case-sensitive filename match between Excel and `.docx` files.
  - Content relation verification using topic/description/article keyword alignment before synthesis.
  - Self-contained localhost server (`server.js`) with zero external npm dependencies required at runtime.
  - **Out of Scope**: Public e-commerce, invented analytics/testimonials, external multi-tenant cloud database hosting, or unauthenticated public registration.

## 2. Traceability Register
| Req ID | Requirement | Implementation | Verification |
|---|---|---|---|
| REQ-01 | Profile-based sign-in with dedicated avatars & password visibility toggle | `index.html` (`#view-auth`, `#login-modal`, `#toggle-login-pass`) | `verify.js` |
| REQ-02 | Content Matrix & URL Matrix upload with SheetJS + Mammoth parsing | `index.html` (`#view-upload`, `#view-url-upload`) | `verify.js` |
| REQ-03 | Compulsory case-sensitive filename match + content relation authenticator + SHA-256 seal | `index.html` (`validateContentSync`, Batch Authenticator) | `verify.js` |
| REQ-04 | Split-screen review viewer + 1-click CMS Bridge autofill + Settings extension download | `index.html` (`#popup-overlay`, `#settings-modal`) | `verify.js` |
| REQ-05 | Memory-only session cleanup on finish/logout/unload | `index.html` (`clearAllSessionData`) | `verify.js` |
| REQ-06 | Secured localhost HTTP server with security headers, `/api/health`, `/api/audit`, `/404.html`, SEO files | `server.js`, `404.html`, `robots.txt`, `sitemap.xml` | `tests/foundation.test.js` |
| REQ-07 | Accessibility (skip link, `<main>`, `:focus-visible`, `prefers-reduced-motion`) | `index.html` | `tests/foundation.test.js` |

## 3. Acceptance Criteria
1. All 15 checks in `verify.js` pass with zero errors.
2. All HTTP endpoint, security header, SEO, and 404 recovery checks in `tests/foundation.test.js` pass.
3. No stale libraries (`jspreadsheet`/`jsuites`), duplicate DOM IDs, or broken `getElementById` references exist.
