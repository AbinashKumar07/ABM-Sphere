# Future Add-On Template & Owner Approval Checklist

## Part III — Future Add-On Template
Use this template when scoping any new capability after the core foundation:

```text
ADD-ON NAME:
BUSINESS GOAL:
USER PROBLEM:
TARGET USERS:
PAGES / COMPONENTS AFFECTED:
USER FLOW:
CONTENT / ASSETS PROVIDED:
DATA MODEL CHANGES:
API / INTEGRATIONS:
ADMIN CONTROLS:
DESIGN / INTERACTION REQUIREMENTS:
SECURITY / PRIVACY IMPACT:
SEO / ANALYTICS IMPACT:
ACCEPTANCE CRITERIA:
TEST CASES:
OUT OF SCOPE:
```

## Part IV — Owner Approval Checklist
- [x] Goals, audience, business model and primary conversion confirmed (`docs/01-discovery-and-prd.md`).
- [x] PRD, TRD, sitemap, app flow, UI/UX, backend/storage schema and implementation plan reviewed (`docs/01`–`docs/04`).
- [x] Technology and localhost runtime justified with zero external npm dependency overhead (`docs/02-trd-and-architecture.md`).
- [x] Factual content, supplied avatars (`avatars/*.png`), and extension bundle (`extensions/ABM_Sphere_CMS_Bridge_v4_2_0.zip`) preserved.
- [x] Pages, forms, admin permissions and user journeys tested (`verify.js` + `tests/foundation.test.js`).
- [x] Security headers, privacy cleanup, accessibility landmarks, performance and SEO files checked (`docs/05-security-seo-and-qa.md`).
- [ ] Production domain, HTTPS termination, and owner-provided analytics (GA4 / Search Console) — deferred until production hosting is provisioned.
- [x] Backups, monitoring (`/api/health`), rollback and maintenance responsibilities documented.
- [x] Source code, documentation, known limitations and handover delivered (`README.md`).
