# Facility composition and encounter redesign

Goal: replace uniform luminous boxes with cinematic layered machinery, longer occluded routes and spatially legible ambushes. Existing weapon, reload and site integration remain intact.

- [x] layout.js: shared obstacle definitions, route checkpoints, front/rear reinforcement anchors; test walking length and collision.
- [x] world.js: physical zigzag corridor, reactor freight diversion, escape cargo chicane, raised cargo and delivery shutters; navigation rebuilt from collision-safe visibility edges.
- [x] runtime.js: choose occluded or rear entry anchors, stage arrivals through marked shutters, preserve wave totals, pause/retry/resource lifecycle.
- [x] ruler.js: replace the current ring-and-box monarch with layered industrial regalia, articulated silhouette, narrow core and foreground/midground/background separation.
- [x] lighting/materials/HUD: fewer continuous luminous lines, local pools of warm neutral light, red restricted entries, blue weapon/exit, quieter bottom telemetry and cinematic captions.
- [x] Browser: validate all route checkpoints, hidden/rear arrivals, actual shooting, complete campaign, screenshots, measured performance; update gallery/report/PR.

Acceptance: obstacles cannot be bypassed by simply walking straight, path stays traversable with closed/open doors; no collision-embedded or near-camera instant spawns; back attacks are signalled at actual entry machinery. Preserve 96-unit progression and auto/R reload. Low-motion preferences and HDR fallback stay functional.
