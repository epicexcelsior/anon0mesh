# v3-full — Recovery + Rebuild Lane

**Branch:** `v3-full` (off `upstream/main`, 2026-04-18)
**Goal:** Recover `v3-full` by making the redesign branch the explicit visual canon, preserving valid backend seams from current `v3-full`, and rebuilding broken core flows into one cohesive production-grade app.
**Status:** Recovery active. `recovery-plan.md` is current execution contract.

## What this folder is

Self-sufficient planning, recovery, and handoff pack for the `v3-full` effort. A fresh-chat agent (or human) should be able to read this folder top-to-bottom and pick up execution without reloading prior conversation context.

## Reading order

Read in this order. Each doc builds on the previous:

1. **[recovery-plan.md](./recovery-plan.md)** — current reset contract. Read this first.
2. **[progress.md](./progress.md)** — **live log**. Execution agents append notes, deviations, open issues here. Read this before any execution session.
3. **[decisions.md](./decisions.md)** — living ledger. Recovery changes update here.
4. **[screen-inventory.md](./screen-inventory.md)** — every surface in scope and current source ownership.
5. **[architecture.md](./architecture.md)** — layer rules, folder structure, import direction, frontend/backend split.
6. **[quality-gates.md](./quality-gates.md)** — lint, typecheck, visual review, terminology lock, commit/doc-update discipline.
7. **[implementation-plan.md](./implementation-plan.md)** — historical execution baseline. Useful for file map, but `recovery-plan.md` supersedes it anywhere source precedence conflicts.
8. **[lxmf-brief.md](./lxmf-brief.md)** — self-contained brief for the parallel agent handling the LXMF NPM package + integration.
9. **[handoff.md](./handoff.md)** — historical kickoff template. Treat `recovery-plan.md` + `progress.md` as the active handoff.

## Active source precedence

Recovery work now follows the precedence from `recovery-plan.md`:

| Source | Path | What it contributes |
|---|---|---|
| **Redesign canon** | `worktrees/anon0mesh-fork-ui` (`feature/ui-redesign`, Void Protocol lane) | Visual system, shell feel, component taste, and screen hierarchy. **Primary visual canon.** |
| **Screen contract docs** | `docs/v3-full/screen-inventory.md`, Stitch/wireframe references | Information architecture, surface purpose, copy shape, route-level requirements. |
| **Current implementation base** | current `v3-full` branch | Expo Router structure, adapters/providers, domain seams, backend wiring that already works. |
| **Workbench** | historical workbench branch/docs | Reference only when it still aligns with redesign direction and does not conflict with the above. |

If a doc in this folder still uses workbench-first wording, treat that as historical unless it has been updated after the recovery reset.

## Current Build-Around Constraints

These are the main areas where current functionality is intentionally being built around rather than claimed as complete:

- **Send delivery path:** the redesigned send flow and recipient QR scan are live, but transfer delivery is still **on-chain only** in this branch. Mesh relay integration lands later.
- **Amount quote:** the send amount screen's USD equivalent is a local estimate, not a live market quote yet.
- **Messaging runtime:** the rebuilt messages list/thread UI is live, but thread history and delivery are still fixture-backed while LXMF runtime work continues.
- **Peer graph depth:** rebuilt peer list/detail surfaces now reflect the live discovery seam, but deeper relay, latency/distance, and beacon-specific metrics are still staged.
- **LXMF runtime:** interface shape is preserved, but the native runtime is still a stub in this branch.
- **Stealth transfer path:** preferences and review-screen affordances exist, but full end-to-end stealth settlement is not live yet. UI and copy should frame this as staged work, not a completed privacy guarantee.
- **Beacon staking:** settings surface exists, backend remains placeholder / coming soon.
- **BLE reliability:** peer discovery is live, but deeper relay reliability work is still deferred.

When in doubt, keep the product feeling strong without overstating what is live.

## Out of scope for this effort

- Full LXMF runtime integration → separate parallel agent; see `lxmf-brief.md`.
- Stealth payment queue real crypto → stub adapters, land later.
- Durable nonce relay end-to-end → port existing code, full flow later.
- BLE reliability fixes (probe/ping rework, packet-size assumptions) → treat as working for now, fix later.
- Beacon co-sign full flow → UI surface only, backend later.
- v2 branch changes → leave alone.

## Docs discipline

- **Commit frequently.** Small scoped commits. See `quality-gates.md` for rules.
- **Update `progress.md` each session.** Append-only log of what changed, what drifted, what's still open.
- **If you break a decision in `decisions.md`, don't silently deviate.** Update `decisions.md` with the change + reason, or open a new ADR in the mempool. Drift without doc update is the failure mode this folder exists to prevent.
- **Concise over bloat.** Add to an existing doc when the note fits; only create new docs when the content doesn't belong anywhere else.

## Related (external / reference)

- Mempool ADR 0004: `anonmesh_mempool/docs/04-decisions/0004-v3-full-unification.md` (durable cross-repo decision)
- Mempool repo profile: `anonmesh_mempool/docs/02-repos/mobile-app.md` (updated after merge)
- Workbench canonical design docs (read-only reference only): `docs/ui-system/` (on `epic/ui-workbench-fixtures` branch)
