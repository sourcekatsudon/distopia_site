# Full introduction and sustained enemy triplets

- Preserve the restaurant → horizontal glitch / warning burst / red overwrite → ruler threat → homepage terminal pullback → dungeon flow. `protocol=play` and the normal launch use the full sequence; explicit `protocol=quick` remains available for regression/debug and a labelled fast-start option.
- Restore the physical homepage terminal at the left of the initial room, using the existing website texture, with protected collision. Camera pulls away from its screen into the same spawn position without obstructing the authored route.
- Replace single or simultaneous shotgun-like enemy volleys with three temporally separate rounds (.10–.14s gaps), lower per-round damage and more frequent recovery cycles. Preserve sniper telegraph, real projectile/cover/shield collision, dodgeable locked aim, and melee role.
- Pool/instance enemy tracers to keep increased bullet count bounded. No wall-clock shooting timers; pause, stagger, death and exit cannot leak delayed rounds.
- Verify full introduction without skipping, terminal collision/route, actual timed triplets/weak damage, shield hits and occlusion, pause/cancel, PC/mobile regressions and performance; publish PR Preview only.
