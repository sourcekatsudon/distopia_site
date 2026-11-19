# Four distinct sectors and cursor flight implementation plan

**Goal:** A→B→C→D→ship, readable enemies, 30s pursuit→short warp→escape success→restaurant. Keep the full v8 introduction.

**Architecture:** Retain Three.js and bounded streaming. Generate a seeded four-sector blueprint per new run, reuse its seed on checkpoint retry. A terminal S-bend, B offset cargo dogleg, C reactor arc, D loading apron/hangar have distinct profiles; variable bend direction, width and cover positions keep routes different. Protected corridor walls and destructible cover share one collision source. No route requires breaking cover. Root integrates all changes; isolated proposal workers own flight and enemy materials.

**Constraints:** No dependencies, external assets or runtime AI. PC High/mobile Low, guaranteed drops, no enemies respawning behind frontier, triple fire and dual sticks stay. Preview only.

## Tasks and verification

- [x] Add failing four-sector tests: A–D only, route <400m, different profiles, multiple seeds differ, same seed stable, all waypoints and swept paths clear for player and large robot, entry anchors clear; retry keeps seed. Adjust growth for four dense encounters.
- [x] Implement `createCampaignLayout(seed)` in `campaign-layout.js`; pass blueprint to streamed world, game route/spawn/checkpoint/HUD. Test 100 seeds including backward stream reload. Add in-world A–D signs and guidance along turns.
- [x] Apply isolated brighter enemy material proposal; inspect actual near/far combat in both qualities. Preserve silhouettes, red threat color, hit meshes and disposal.
- [x] Apply isolated flight timeline/aim proposal. Integrate absolute mouse coordinates and visible reticle; release pointer lock without pausing when boarding, resume flight without relocking. Keyboard movement is independent, touch stays dual-stick.
- [x] Verify flight enters warp after 30 combat seconds, completes after 4-second warp, shows Japanese escape success then automatically restores restaurant DOM/scroll/input/audio. Pause freezes timer, exit clears callbacks.
- [x] Update obsolete tests for revised contract; run all CI suites, full intro, PC/mobile integration, multi-seed route walking and real-input full ground+flight run. Capture A–D, readable enemies, cursor aiming and ending; record measured performance and untested hardware limitations.
- [ ] Independent review, inspect diff, commit/push preview, verify exact remote build and CI, update PR and concise report.
