# ESCAPE PROTOCOL ASCENSION implementation plan

**Goal:** complete attached v2 gameplay redesign in existing PR #2, preserve restaurant/intro/PC+mobile presentation, preview only.
**Spec:** user attachment ea67da2e-10e7-4e49-b665-9109d1b25da8.
**Architecture:** data-driven armory and combat; persistent run ledger for stable reward IDs/checkpoint growth/environment HP; 32 streamed80m facility segments; pooled breakables/pickups/projectiles; standalone180s third-person flight. Runtime orchestrates rendering/input/audio with bounded entities.

## Contracts
- Armory: WEAPON_LEVELS and shotFor(level,charge), createWeaponModel(level,{quality}) maintains original viewmodel API.
- World: campaign-layout32x80m and2.4..2.8km ROUTE; createCampaignWorld arrayscolliders/navNodes/destructibles/entries stable; ensureAt(z),refreshNavigation,signalEntry,update,dispose. DescriptorIDs stable, no renderable breakables inworld.
- Flight: createSpaceFlight({scene,camera,quality,level,duration:180,onComplete,onFailure,onEvent}) update(dt,time,{x,y,fire,reducedMotion}), stats,dispose; noownRAF/listeners/renderer/audio.
- Root owns campaign/combat/destructibles/pickups/enemyvariants/runtime/UI/tests.

## Rulings
Growth is committed to the checkpoint ledger immediately on module collection while position saves every160m. Stable pickup/encounter IDs survive retries; no duplicate farming. Guaranteed sixteen relays recover visibly to the player if passed, ensuring LV3 remains reachable. Ordinary encounters are optional and do not lock advancement. Protected floors/structuralwalls/boardingbay cannot be destroyed. No newengine/dependencies/productionmerge.

## Review focus
- Retry preserves real earned growth/IDs without duplicating rewards, even if level changed after checkpoint.
- Destroyed cover disables all physical/ray/navigation obstruction, survives streamed unload/reload, explosion chains bounded.
- Weapon swap resources released, LV1/2 distinct andnocharge; noammo regeneration andreloadlocks until modelcell inserted.
- Enemy projectiles use swept collision, telegraph/aimlock dodgeable, no artificial60s kill; mobileautofire respects cover/manualcharge/reload.
- Segment andflight pools bounded; exit/retry restorecamera/input/audio/resources.

## Tasks
- [x] Baseline/branch/spec audit, external balance review, fixed contracts.
- [x] Tests first: ammo reload capacity, moduleIDs/checkpoint, damage/shieldtimer,4destructionstates, encounterprogress and7roles.
- [x] Armorymodels LV1..5 and data with named swaps, hands anduniquereload; preserveLV3newreactor.
- [x] Combat7 roles/telegraphs/frontshield/sniperlock/melee/turret and damage/feedback.
- [x] Persistent breakables5types, staged damage/debris, enemycoverdamage andgeneratorAoE/collider/nav updates.
- [x] Streamedfacility~2.65km, forwardencounters,16guaranteedmodules+randomdrops/magnet, checkpoints/supplies.
- [x] Wire runtimewithcampaigninstead96killgates; levelHUD/ammo/evolution/deathcause; preserveintro+dualsticks.
- [x] Hangarboarding,180sflightsteer/shoot/damage/shipupgrade+warp+site return.
- [x] Headlessstate/regression and realbrowserA/B/C/D combat balance, replayprogression/checkpoints/destruction/fullflight.
- [x] Actual LV1..5/enemy7/breakable/flight screenshots, source-freecritic, performance1080p/low/resourcecycles.
- [ ] Report measuredtimes/risks, PRpreviewCI andremoteverification; no productionmerge.
