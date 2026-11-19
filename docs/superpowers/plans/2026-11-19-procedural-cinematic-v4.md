# Procedural cinematic overhaul v4

Spec: user attachment 3192a056-9877-47d9-a208-6d2a76dfdf9c and mobile/shield/breath additions, 2026-11-19.

Architecture: retain vendored Three r160/WebGL. Normal restaurant remains a lazily integrated static site. Device policy is pure and touch controls are loaded only with FPS. No reference code/assets imported; reference repository inspected for general techniques and independent visual evaluation process only.

- [x] Baseline source-free Visual Critic, fixed screenshots and objective shortcomings.
- [x] Weapon gate: custom lofted receiver/rail shells, differentiated generated PBR surfaces, sequenced mechanisms, exactly5x breath amplitude; normal/charge/fire actual captures and independent re-review before broader art.
- [x] Platform: Low/Medium/High budgets, playable smartphone touch FPS, no Pointer Lock on touch, portrait/landscape; preserve automatic website opt-out on touch.
- [x] VFX: luminous enemy tracer cores/trails, arrival/impact clarity, local spherical hex shield hit and visual-only reflected tracer. Shield math does not alter damage/game logic.
- [x] Rendering: depth-aware PC contact AO, procedural roughness/normal maps, bounded bloom; low direct rendering, reduced motion; GPU budget and cleanup.
- [x] Characters/environment/ruler: custom mechanical profiles, dark brow/red sensors, load-bearing limbs; heavy mantle/architectural scale; lighting hierarchy. Reuse procedural surface kit and geometry.
- [x] QA lab: eight deterministic camera states plus >=8 shot/hit/destruction frames, debug only on loopback or explicit deployment development flag. Record real browser gameplay video. Same rendering presets as game.
- [x] Independent image-only critic rounds; retain unresolved Major issues as open, not visual completion.
- [x] Node/browser/mobile simulation and PC representative 60s benchmark including frame p95/p99, GPU timing if available, resources/restart, website lazy loading; deploy preview and report actual limits.

Reference research: https://github.com/viktorkav/uno-com-escada (noncommercial; no code copied). CPU procedural meshes/Canvas baking and WebGL rendering selected to preserve phone compatibility; WebGPU migration not justified.

Completed implementation and local verification. Phone performance remains an explicit unmeasured limit; source-free still/sequence critiques pass with Moderate polish recorded. Preview/CI final evidence is recorded in FPS_CINEMATIC_V4.md.
