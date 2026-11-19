# BLUE REQUIEM visual overhaul implementation plan

**Goal:** A procedural, mechanically animated hero railgun with a readable split-rail silhouette and controlled electric-blue emission, then a coherent red/black enemy facility.
**Architecture:** Preserve createRailgun root/muzzle/update/fire/dispose API. Separate receiver, slide, two rail carriers, segmented accelerators, cell, hinged cooling plates, and muzzle VFX in a named hierarchy. Reuse geometry/materials and bound all effects.
**Tech Stack:** Vendored Three.js r160, CanvasTexture, procedural geometry, WebGL.
**Spec:** User's detailed weapon/enemy/environment briefs and concept references in this conversation.

## Constraints
No runtime AI API, new dependencies, external asset pack, gameplay/API changes, or changes to the restaurant menu/site. Weapon review precedes broader art changes. Existing uncommitted changes: none at start.

## File plan and review gates
- [x] `js/fps/weapon.js`: replace rectangular receiver with chamfered layered armor; two independent rail carriers; three segmented accelerator rings; visible left-side cell, cables, fins, recoil slides, procedural markings. Name all mechanical groups. Preserve API and disposal.
- [x] `js/fps/runtime.js`: tune camera placement/lighting for new viewmodel, preserve aim ray and muzzle origin. Add debug-only deterministic pose inspection for screenshots if needed.
- [x] `js/fps/effects.js`: bounded muzzle/beam/impact arcs and afterglow; normal/charged distinction.
- [x] Browser weapon gate: actual gameplay idle/charge/fire captures at 1440x1000, narrow aspect, light mode; inspect silhouettes and highlight clipping. Check disposal and draw/triangle delta. Do not proceed deeply on actors/world until weapon passes this review.
- [x] After weapon gate: `actors.js`, `world.js`, `materials.js`, `protocol.css`, optional dedicated rendering module: readable machine soldiers, richer throne/facility, controlled glow and HUD.
- [x] Run simulation/lifecycle/glitch/site checks, relevant browser regression and performance sample. Update `docs/FPS_GALLERY.md`, verification report, capture sequence and limitations.

## Weapon composition
Rear titanium spine and asymmetric chamfered armor → side-mounted cylindrical energy cartridge → exposed central chamber with two separate rails and ceramic insulators → three split hexagonal magnetic collars → open four-prong muzzle accelerator. Left-facing instrumentation is visible from the camera. Cooling leaves hinge outward after shots. Mechanical forearm supports receiver.

## Acceptance
Crosshair and target remain clear. Cyan energy is distinct from metal; idle remains legible. Charge opens rail carriers and accelerates collars; firing recoils receiver/slide, flashes at the actual muzzle, then opens fins. No new geometries/materials in update/fire. Dispose is idempotent and releases owned resources. Record real screenshots and measured performance, not inferred quality.

Implementation ledger: weapon was rendered and revised through four geometry/light iterations before robot/world work. Added user-requested auto/R capacitor exchange, physical glyph meter and two-handed breathing pose. Integration review findings (HDR fallback, quality resize, axial field orientation, format-specific MSAA) were checked and fixed. Separate viewmodel depth pass preserves wall visibility; aim-ray collision remains authoritative. See FPS_ART_REPORT.md for final evidence and measured limits.
