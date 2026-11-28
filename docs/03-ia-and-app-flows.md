# Information Architecture & Application Flows

## 1. Information Architecture & URL Plan
| Route / View | Purpose | Access |
|---|---|---|
| `/` (`#view-auth`) | Profile selector & Admin Console entry | Public on localhost |
| `/` (`#view-upload`, `#view-url-upload`) | Content Matrix & URL Matrix upload + 1-to-1 sync validation | Authenticated user |
| `/` (`#view-batch`, `#view-url-batch`) | Paginated batch queue (15 items/page), exports, and session finish | Authenticated user |
| `/` (`#popup-overlay`, `#url-popup-overlay`) | Split-screen editorial / URL review modal + CMS Bridge push | Authenticated user |
| `/` (`#view-admin-dashboard`) | User CRUD, permission toggles, and audit log viewer | Admin role only |
| `/404.html` | Custom accessible 404 recovery page for unknown routes | Any unknown route (`404`) |
| `/api/health` | Operational health & readiness endpoint | Localhost / monitoring |
| `/robots.txt`, `/sitemap.xml` | Crawler directives and URL index | Standard web roots |

## 2. Primary Application Flows
1. **Sign-In Flow**: User selects profile card -> enters password (with eye visibility toggle) -> verified -> `enterApp()` opens Content Matrix (`#view-upload`).
2. **Content Matrix Sync Flow**: User drops `.xlsx` and `.docx` -> exact case-sensitive filename check -> keyword/IDF content alignment scoring -> clean matches auto-unlock with SHA-256 pair seal (or require Batch Authenticator sign-off / Admin Override when warnings exist).
3. **Review & CMS Bridge Flow**: User clicks `Start Reading Queue` or `Review ↗` -> inspects/edits Topic, Title, Description, Remarks, Rich Article -> clicks `Send to CMS` -> exports synced `.xlsx` + `.docx` pair -> clicks `Finish Session` to wipe all session state.
4. **Error & Recovery States**: Invalid JSON (`400`), oversized payload (`413`), rate limit exceeded (`429`), unknown route (`404` with `404.html` recovery links), CDN fallback retry banner (`#lib-load-banner`).
