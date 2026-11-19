# Blue Requiem energy and dual-stick mobile implementation plan

**Goal:** Integrate only the missing ZIP energy overlay and replace mobile drag/fire/jump controls with two analog sticks and crosshair-triggered fire.
**Architecture:** Preserve Three r160, existing viewmodel post stack and weapon gameplay. New energy meshes mount after static batching. Touch sets analog move/look vectors; runtime performs wall-occluded exact mesh target checks at a bounded rate and requests ordinary shots. No aim snap, no reflected damage.
**Spec:** User ZIP CODEX_INTEGRATION.md and latest mobile instruction. Earlier authorization to implement/review/preview persists; no production merge.

## Review focus
- Dead/arriving/hidden enemies or enemies behind a wall must never trigger auto fire.
- Each stick/charge action has one pointer owner; release, cancellation, rotation, pause and exit clear input without shooting.
- Right stick continuously rotates while held and stops on release; low FPS must not alter sensitivity.
- Mobile has no jump/dash; PC keys, firing, charge, glyphs and reload remain intact.
- New shader/dynamic meshes render on viewmodel layer, do not cover crosshair/hands, and release instance resources. Reduced motion freezes cosmetic FX.

## Tasks
- [x] Audit ZIP vs current implementation: existing glow/coil/reload preserved; missing flowing distributed slits, grip reactor/gyros, limiter motion and streamer ribbons added.
- [x] Record equivalent High/Low before captures and timed battle baseline.
- [x] Update meaningful failing touch tests for two analog sticks, exclusive owners, cancel/reset/dispose; add targeting tests for blockers/dead/arrival/cooldown/charge.
- [x] Implement touch.js + CSS: left move, right look; small charge/E/reload/pause controls, AUTO status. Remove mobile jump and manual FIRE. Integrate angular rates and occlusion-safe auto fire in runtime with PC behavior unchanged.
- [x] Integrate reviewed ZIP FX proposal into weapon after batch(rig), forward update/fire/dispose and inspect stats. Adjust mounts against actual High/Low idle/charge/fire/reload screenshots; image-only critic.
- [x] Browser tests: real pointer multitouch, auto-fire hit/offtarget/occlusion/reload/pause/rotation, PC weapon regression, normal-site lazy load and exit lifecycle.
- [x] Equivalent High/Low after measurement; actual screenshots/sequence capture, report delta and real-phone limitations.
- [x] Independent code review, Node/CI, commit to existing feature PR and verify preview. Update gallery/report without claiming physical phone measurements.

Ruling: retain the small CHARGE control for heavy enemies and E/reload/pause; only FIRE/jump/dash are removed from touch. Automatic shots are ordinary fire and pause while charging/reloading. Deadzone is radial 0.14; right-stick maximum yaw2.8/pitch2.1 radians per second with dt, no auto aim. These are Codex implementation choices within the supplied interaction intent.

Ledger: image gate first held for filled reactor, corrected smaller core/dark ring gaps; fresh still and24-frame gate passed. Automatic windup now rechecks/refunds off-target and yields toCHARGE/R; each addedregression observed FAIL then PASS. Node9/mobile33/energy18/weapon15/FPS25/edge16 pass. Preview final verification follows published feature branch.
