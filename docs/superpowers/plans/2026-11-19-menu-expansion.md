# Menu expansion implementation plan

Goal: Expand the existing restaurant catalog using visually verified supplied photos; update existing PR and deploy Preview only.
Architecture: Preserve static HTML/CSS/JS and solar map. CHICKEN_MENU remains the single source; add subcategory, recommended and optional gallery. Keep six legacy IDs.
Spec: User supplied Chicken House handoff (2026-11-19).

Constraints: No solar-system.js/company.html/deployment-setting changes; no production merge. No external worker writes, dependencies, secrets or publishing. Codex integrates reviewed proposals.

- [x] 1. Audit all 80 images; hash duplicates, inspect visual groups and text/price conflicts; publish manifest and optimized WebP plus contact sheets.
- [x] 2. Write failing catalog tests for expanded data, legacy IDs, gallery paths and manifest coverage; implement verified catalog and mappings.
- [x] 3. Sonnet proposes bounded UI changes; integrate category/search/count/load more, gallery and related items. Verify zero matches, invalid ID, legacy main filter, URL state and mobile.
- [x] 4. Update selected homepage feature photos from centralized data; preserve overall design.
- [x] 5. Run syntax/smoke/browser checks, inspect desktop/mobile screenshots and solar behavior; obtain independent Opus review, fix verified findings.
- [x] 6. Commit/push same feature branch, update PR #1, deploy Vercel Preview and verify URL/access limits.

Review focus: empty search; unknown category/ID; history restoration; gallery selection; mobile overflow and map regression.
Execution: Codex owns integration and tests; user explicitly delegates routine decisions and requests Antigravity workers.
