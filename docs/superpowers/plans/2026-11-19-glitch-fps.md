# GLITCH PROTOCOL / FPS ESCAPE implementation plan

Goal: A playable, procedural first-person escape game reached from a fictional horror overlay, preserving the existing restaurant and solar map.
Architecture: static ES modules, lazy imported runtime, locally vendored Three.js 0.160.1. No runtime AI or backend. Metres, Y up, forward -Z, spawn(0,1.7,8), exit(0,1.7,-122). Fixed seed731. Separate materials/world/weapon/actors/simulation/audio/effects/runtime/site-trigger modules.
Spec: user attachment GLITCH PROTOCOL / FPS ESCAPE (2026-11-19); creative decisions explicitly delegated by user. Existing menu branch ac45e3a is base; new game branch preserves PR1.

- [x] 1. Write pure simulation tests for seeded maps, collision, movement, enemy states, combat and progress; implement simulation and controls.
- [x] 2. Integrate Team B world/materials and Team C weapon/actors proposal-only outputs, inspect code, browser-test actual geometry and resource lifetimes.
- [x] 3. Complete five-area waves, raycast damage, normal/charged fire, destructible robot parts, particles, HUD, pause/retry/win and cleanup.
- [x] 4. Add site trigger: 60–120 active seconds, per-session once, persistent opt-out, debug query, safe overlays, procedural throne and terminal pullback, explicit pointer-lock start; mobile/WebGL fallbacks.
- [x] 5. Browser playthrough, screenshots of all phases, performance/cleanup tests, existing regression, independent review, fixes.
- [x] 6. Commit, push new branch, create PR to existing menu branch, Vercel Preview, verify live source and access.

Owners: Codex integration/gameplay/QA and final decisions; Antigravity Sonnet world/materials and weapon/actors independently, proposal-only no filesystem/production access. No secrets or customer data provided. Two worker processes maximum initially.
Review focus: exit always reachable; no input/audio leaks; visibility/pointer-lock transitions; WebGL failure; restart memory growth; slow/failed module loading; off-by-one wave gate locks.
