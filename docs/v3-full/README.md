# v3-full — Unified UI MVP

**Branch:** `v3-full` (off `upstream/main`, 2026-04-18)
**Goal:** Merge workbench design system + v3 branch content + Claude Design wireframe references into a single cohesive production-grade app. Scaffold a clean frontend/backend separation so the remaining backend integrations can land cleanly as they complete.
**Status:** Planning complete (this folder). Execution pending.

## What this folder is

Self-sufficient planning and handoff pack for the `v3-full` effort. A fresh-chat agent (or human) should be able to read this folder top-to-bottom and pick up execution without reloading prior conversation context.

## Reading order

Read in this order. Each doc builds on the previous:

1. **[decisions.md](./decisions.md)** — the ledger. Every committed decision with rationale. Start here.
2. **[architecture.md](./architecture.md)** — layer rules, folder structure, import direction, frontend/backend split.
3. **[screen-inventory.md](./screen-inventory.md)** — every surface in scope (~20), source-of-truth for each, content/design origin.
4. **[implementation-plan.md](./implementation-plan.md)** — file-by-file sequential plan. This is the execution roadmap.
5. **[quality-gates.md](./quality-gates.md)** — lint, typecheck, visual review, terminology lock, commit/doc-update discipline.
6. **[progress.md](./progress.md)** — **live log**. Execution agents append notes, deviations, open issues here. Read this before any execution session.
7. **[lxmf-brief.md](./lxmf-brief.md)** — self-contained brief for the parallel agent handling the LXMF NPM package + integration.
8. **[handoff.md](./handoff.md)** — kickoff prompt template and context-loading rules for the fresh execution session.

## Three source artifacts

The unified MVP pulls from three prior sources. See `decisions.md` for the merge rules. Summary:

| Source | Path | What it contributes |
|---|---|---|
| **Workbench** | `epic/ui-workbench-fixtures` branch, `components/dev/workbench/` | Design system (tokens, motion, sound, haptics, primitives), Home/Messages/Send/Success/Settings screen polish, fixtures, presets. **Primary design language.** |
| **v3 branch** | `upstream/v3`, `mobile_app/` subfolder | Real engineering: BeaconRegistry, PeersDrawer new-conversation flow, wallet infrastructure, useGlass consolidation, components extracted by domain. **Primary content + secondary polish (modals, drawers, gestures).** |
| **Claude Design wireframe** | `/home/epic/Downloads/Telegram Desktop/anonmesh_ui_ux/` | HTML+JSX static wireframe + `styles.css`. Information architecture ideas, copy, mesh status bar pattern. **Reference only** — design language does not win. |

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

## Related (external)

- Mempool ADR 0004: `anonmesh_mempool/docs/04-decisions/0004-v3-full-unification.md` (durable cross-repo decision)
- Mempool repo profile: `anonmesh_mempool/docs/02-repos/mobile-app.md` (updated after merge)
- Workbench canonical design docs (read-only reference): `docs/ui-system/` (on `epic/ui-workbench-fixtures` branch)
