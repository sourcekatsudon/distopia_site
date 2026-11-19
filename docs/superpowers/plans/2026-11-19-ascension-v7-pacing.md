# ASCENSION: shorter course and forward combat

User request: half the course, twice the enemies, no reinforcements in passed areas; guaranteed large bright drops, pickup body glow, retuned weapon growth, fixed turrets and sector alarms.

- Reduce 32 × 80m to 16 × 80m, keep the existing corner/cover geometry and flight ending; derive all hangar/UI/route distances from layout constants.
- Double total authored opponents from 152 to 304 across 15 combat sectors; bounded simultaneous actors and faster front-only releases. Promote fixed turret emplacements as a clear role.
- Never schedule enemies in a passed sector or behind the player's current forward position. Preserve defeated encounter IDs across checkpoint retries; no repeat farming.
- Every defeated enemy drops a module, including LV5. Initial cumulative level thresholds 12 / 48 / 100 / 160; adjust from full-run pickup observations. Enemy drops are the progression source; trailing magnet recovers missed pickups.
- Increase drop silhouette/HDR glow, add floor markers and a half-second peripheral blue pickup pulse; stronger pulse on actual evolution.
- Sector letter warning banner, rotating red facility beacons and a bounded synthesized siren; reduced-motion mode keeps a steady warning.
- Verify route/collision, 304 authored roles, no backward spawns on movement/backtracking/retry, drops at all levels, real pickup flash, turret immobility, mobile controls, alarms, complete flight and cleanup; measure PC performance and publish the existing PR's Preview.

Implementation owner: Codex (campaign/runtime/QA/integration); isolated proposals: pickup feedback and alarm VFX; Antigravity Sonnet: balance advisory. No production merge.

Local verification: 16 Node suites; desktop regression57/mobile58; v7 desktop20/mobile20; full ground471.60s with207kills and207actualcollections, LV5 at376.4s; flight180s completed. High20s/1080p/max12enemies mean58.54fps. Preview/CI verification follows feature-branch push.
