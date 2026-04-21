# decisions.md — v3-full living decision ledger

**Last updated:** 2026-04-20 (recovery reset — redesign-first precedence restored)
**Status:** active
**Owner:** @intern (team lead reviews)

This is the authoritative ledger. When you deviate, update this doc in the same commit as the deviation. See `quality-gates.md` § "doc discipline".

Decisions are prefixed `D#`. Cross-reference by ID in commits and `progress.md`.

---

## Motivation

Three parallel UI tracks exist:

- **Redesign canon** (`worktrees/anon0mesh-fork-ui`, Void Protocol lane) — approved visual direction, shell feel, component taste, and revised screen hierarchy.
- **Current `v3-full`** — integration lane with working Expo Router structure, providers/adapters, and much of the backend seam work already landed.
- **Wireframe / Stitch-derived docs** — information architecture, route purposes, copy shape, mesh-status framing.

The team needs one production-grade MVP. Recovery work keeps `v3-full` as the implementation lane, but resets visual precedence so design comes from the redesign canon, product contract comes from the docs in this folder, and architecture/backends come from current `v3-full`.

---

## Scope

**In scope (this effort):**

- All UI screens and navigation, end-to-end wired (~20 surfaces; see `screen-inventory.md`).
- Full design system: tokens, primitives, motion, haptics, sound, glass surfaces.
- Onboarding flow: landing + welcome + setup + optional tech deep-dive drawer (the "wow" animation is a polish pass, shippable without it).
- Frontend/backend layer separation baked in from day 1 (hexagonal-lite; see `architecture.md`).
- Port of all available backend code from v3/v2 that is stable: MWA wallet adapter, local wallet create/import, basic Solana transaction service, BLE mesh context skeleton.
- Typed stub hooks + interfaces for not-yet-ready backend (LXMF, stealth queue, beacon co-sign). Drop-in replacement when those tracks land.
- `/dev` catalog route preserved as design preview lane on the new branch.

**Out of scope (deferred to other efforts):**

- Full LXMF runtime — parallel agent track, see `lxmf-brief.md`.
- Stealth payment real crypto.
- Durable nonce/beacon co-sign full flow.
- BLE reliability fixes.
- Landing-screen mesh-particle-canvas and first-open logo animation (polish pass).
- v2 branch changes.

---

## Decisions

### Recovery reset

**2026-04-20 recovery reset.** The earlier workbench-first visual precedence is stale. Effective immediately:

1. **Visual system / taste / tokens / component feel:** `worktrees/anon0mesh-fork-ui` (Void Protocol lane)
2. **Information architecture / screen contract:** `screen-inventory.md` plus the referenced wireframe/Stitch sources
3. **Architecture / adapters / backend seams:** current `v3-full`
4. **Workbench:** reference only when it still aligns with 1–3

Any older wording in this file that sounds like "port workbench verbatim" should be read through that override.

### Branch & structure

**D1. Branch name + base.** `v3-full`, cut from `upstream/main` on 2026-04-18. Not based on v2, not based on workbench's v2-anchored branch, not based on v3 branch's `mobile_app/` restructure. Clean slate. Workbench code, v3 code, and wireframe references are pulled in as ports, not as inherited history.

**D2. Folder structure.** Flat top-level. No `mobile_app/` subfolder. See `architecture.md` § "Folder structure" for the full tree. Rationale: subfolder is a monorepo pattern; we have one app, YAGNI.

**D3. v2 branch fate.** Leave alone. No rename, no delete, no archive tag yet. Decide later after v3-full is merged to main.

### Information architecture

**D4. Tab count + labels.** 3 tabs locked: `Home` / `Messages` / `Settings`. Supersedes v3 branch's 4-tab (index/nodes/settings/wallet) and wireframe's 4-tab (messages/wallet/nodes/id). Follows workbench + ADR 0003. Rationale: team lead wanted more peer network info surfaced, but user held the 3-tab line with opt-in depth via the Peers sheet (D6).

**D5. Send CTA location.** Home hero. Not a tab, not a Settings action. Send is a wallet action and Home is wallet-led.

**D6. Peer info surfacing.** Mesh status strip is a **persistent slim band** at the top of every tab (below safe-area status bar, above content). Not a tab, not buried in Settings. Shows signal-bar icon, peer count, and connection state chip (Live / Silent / Offline). Tap opens the Peers sheet (live peer list, signal, iface, beacon stake, per-peer actions: message/send). Height ≈32px; glass-soft variant; tinted to match each tab's Backdrop preset.

**Why persistent across tabs (not Home-header-only):** mesh state must be ambient for a privacy-first product. Hiding it on Messages/Settings forces users to tab-switch to check "am I connected?", which is exactly the kind of surface friction this app should remove.

**Why not a tab:** the 3-tab IA (D4) is locked. Peers is an on-demand surface, not a destination.

**Iteration clause:** initial placement is persistent-band-across-all-tabs. If screen real estate becomes contested during Phase 2/3 polish, relocation to Home-header-only is an acceptable fallback — update this decision if so.

**D7. Content remap from v3/wireframe 4-tab → 3-tab.**

| v3/wireframe element | Lives in v3-full |
|---|---|
| Wallet balance + history + send + receive | Home (segmented control for Balance ↔ History) |
| Transaction confirmation | Home flow (push) |
| Mesh status / nodes summary | Home mesh status strip |
| Peer list + peer detail | Peers sheet (from status strip) + push on peer tap |
| Messages list + conversation detail | Messages |
| New conversation flow (PeersDrawer pattern from v3) | Messages |
| Identity / QR / wallet export | Settings modals |
| Network config (BLE/LoRa/LXMF iface, auto-connect) | Settings sub-page |
| Beacon registry (stake SOL) | Settings sub-page |
| Privacy toggles (stealth, tx privacy, key rotation) | Settings |
| About / tech deep dive | Settings |

### Design system

**D8. Token storage.** `src/design-system/` remains the one active token/primitives lane. Do **not** introduce a second token system. During recovery, keep the current file structure (`foundation.ts`, `semantic.ts`, `component.ts`, `state.ts`, `motion.ts`, `registry.ts`, `index.ts`) but reconcile values and semantics to the redesign canon. **No CSS** — React Native cannot load CSS at runtime; wireframe CSS remains reference-only.

**D9. Token source merge rules.**

| Token family | Primary source | Fill gaps from |
|---|---|---|
| Colors / shell surfaces / contrast | Redesign canon (Void Protocol lane) | current `src/design-system/` structure, wireframe references |
| Typography / display vs technical mono | Redesign canon | current font loading setup if it still matches |
| Spacing / radius contracts | current `src/design-system/` | redesign canon for feel changes |
| Motion / haptics / sound | current `v3-full` contracts where they still fit | redesign canon when specific interaction feel differs |
| Glass / elevated surfaces | Redesign canon first | wireframe density cues, current glass variants |

**D10. Mesh-terminal aesthetic weight.** Restrained and intentional. Mesh/diagnostic surfaces can carry more terminal/editorial character, but wallet-critical screens must stay calm, legible, and trust-forward. The redesign canon wins this balance, not the older workbench lane.

**D11. Tab bar style.** Flush bottom bar, safe-area-padded, not floating. Active-indicator behavior can evolve during recovery, but final feel should match the redesign canon while preserving the locked 3-tab IA.

**D12. Palette.** Redesign canon owns palette direction. The current `src/design-system/` values are implementation state, not a locked contract. Recovery Phase 2 reconciles them into one real source; do not treat old workbench hex values as canonical just because they exist in code.

**D13. Primitive preservation rule.** Keep useful primitives and interaction contracts already in `v3-full` (`DepthButton`, `SlideToConfirm`, `Sheet`, motion, haptics, sound, terminology lock) only when they still serve the redesign canon. Reuse structure; do not preserve visual drift for its own sake.

**D14. Icons.** Feather (from `@expo/vector-icons`) as the default set. Custom SVGs lifted from `anonmesh_ui_ux/icons.jsx` for the mesh-specific glyphs Feather lacks (signal bars, mesh-nodes shape, beacon, identity chip). Anonmesh logo + wordmark available under `assets/brand/`. Port the logo from `mobile_app/assets/images/logos/anonmesh_logo.png`.

### Frontend / backend

**D15. Layer architecture.** Hexagonal-lite. Four layers with one-way import direction:

```
components/  →  src/hooks/  →  src/domain/  ←  src/infrastructure/{ble,lxmf,mwa,solana}/
```

- `src/domain/` is pure TypeScript: entities, value types, service interfaces. No RN imports, no side effects.
- `src/infrastructure/<adapter>/` implements domain interfaces with real side effects (BLE, LXMF, MWA, Solana).
- `src/hooks/` bridges components to domain. Components never import infrastructure directly.
- `components/` is UI. Reads from hooks, renders, calls back through hook actions.

See `architecture.md` for the full rules.

**D16. Real-vs-stub backend for MVP.**

| Surface | This session | Later |
|---|---|---|
| MWA wallet connect (Android/Seeker) | port from v3 `src/infrastructure/wallet/MWA/MWAWalletAdapter.ts`, wire into onboarding + Send | iOS path stays local-wallet only |
| Local wallet create/import | port from v3 `LocalWalletAdapter`, wire full flow | — |
| Solana balance + send tx | port from v3 `src/domain/services/SolanaTransactionService.ts` | relay + stealth wrapping later |
| BLE mesh context | port from v3 `src/contexts/MeshBLEContext.tsx`, wire status strip + peers sheet to real data when running, fixture fallback otherwise | reliability + packet fixes |
| LXMF | stub hook `useLxmf` with the public API shape from `@lxmf/react-native` (see lxmf-brief.md); returns empty/fixture data; swap to real pkg when parallel agent publishes | parallel agent lands |
| Stealth payment queue | placeholder adapter with clean interface; returns mock IDs | real crypto later |
| Beacon co-sign | UI surface only (Settings → Beacon registry); stub for stake flow | backend later |
| Durable nonce | port if stable, else stub | full e2e later |

### Onboarding

**D17. Onboarding flow.** Closest to option B but without locking users in.

1. **Landing** — immersive full-screen, "ENTER THE MESH" CTA. Logo + placeholder wordmark for this session; mesh-particle viz + logo animation is polish pass (user said: "wow them" but shippable without it).
2. **Welcome** — "Private by default" headline, 3-4 feature highlights (mesh, private, on-chain, offline), "GET STARTED" + "I have an identity" (import) options.
3. **Setup** — display name (optional, auto-alias), permission priming (**explanation of why each permission is needed, then OS dialog fires** — not toggles). Wallet path choice: Create New (local) or Connect (MWA on Android).
4. **Enter the mesh** → navigate to Home. If any permission declined, do not block; ask contextually when the feature is accessed (e.g. Bluetooth permission asked when mesh status strip tries to start).
5. **Tech deep-dive drawer** — accessible from Welcome or Setup as "Under the hood" button. Short explainer: what LXMF / Reticulum / BLE mesh / Solana stealth are. Don't force it on anyone. Visuals deferred to polish pass.

**D18. Onboarding philosophy.** The app should be usable without any tutorial. Empty states and contextual first-use tooltips carry teaching. The onboarding is priming + setup, not education.

### Docs & process

**D19. Doc location.** All v3-full planning and execution docs live in `anon0mesh/docs/v3-full/`. Clearly labeled, self-contained. Do not scatter into the rest of `anon0mesh/docs/`.

**D20. Decision ledger pattern.** This file (`decisions.md`) is the ledger. Each decision has a stable ID (D1, D2, ...). Commits referencing a decision use its ID. When a decision changes, update this file in the same commit as the deviation; note the prior decision as superseded, don't delete it.

**D21. Mempool ADR.** One ADR in mempool captures the durable cross-repo decision: `anonmesh_mempool/docs/04-decisions/0004-v3-full-unification.md`. It supersedes parts of ADR 0003 (the workbench lock on screen scope and `/dev`-only isolation).

**D22. Progress log.** `progress.md` is the live session log. Append-only. Each execution session starts with a log entry (date, model, goal) and ends with one (deviations, open issues, handoff note). Fresh chats read this first.

**D23. Commit + doc-update discipline.** See `quality-gates.md`. TL;DR: small scoped commits; doc updates ride with the code; deviations from `decisions.md` must update the ledger in the same commit; progress.md gets an entry at session end minimum.

### LXMF package (parallel track)

**D24. LXMF package strategy.** Parallel agent handles. Brief in `lxmf-brief.md`. Package name `@lxmf/react-native` (already scaffolded in `/home/epic/Downloads/anonmesh/lxmf_react_native_rust/expo-module/`). Parallel agent's job: build Rust libs for both platforms, test example-app, publish to npm, then PR the swap-in to v3-full (replace the stub `useLxmf` with the real import).

**D25. Stub hook API shape.** `useLxmf` in v3-full mirrors the real package's public API from day 1. Method/type signatures identical. When the real package lands, the swap is a single import change. See `lxmf-brief.md` for the API surface.

### Execution handoff

**D26. Model strategy.**

| Phase | Model | Why |
|---|---|---|
| Planning (this session) | Opus 4.7 | architectural judgment |
| Execution (next session) | Sonnet 4.6 | follows tight plan, faster + cheaper |
| Stuck points / review | Opus 4.7 spot-check | safety net |
| Parallel LXMF agent | Sonnet 4.6 | brief is self-contained |
| Not recommended for execution | Haiku 4.5 | too risky for RN glass/motion polish work on deadline |

**D27. Execution handoff doc.** `handoff.md` contains the fresh-chat kickoff prompt, required context (list of files to load), and the first action the agent takes.

### Quality

**D28. Quality bar.** No shortcuts. Recovery can stage work, but the branch should converge toward one authored product, not a hybrid accident. Concretely:

- Pass 1: make docs truthful, fix broken flows, and re-establish one clear design canon.
- Pass 2: rebuild surfaces with correct hierarchy/content, motion + haptics + sound still wired.
- Pass 2: polish alignment, spacing, consistency, edge states.
- No redesign loops. If something feels wrong, check the redesign canon + `recovery-plan.md` first before altering.

**D29. Terminology lock.** Carry over from ADR 0003:

- Transfer states: `Queued on device` / `Handed to mesh` / `Settled` — never `Pending`, `Broadcasting`, `Confirmed`.
- Proof: `Proof attached` (active), not `Proof retained` (passive).
- Private mode: `Stealth`, not `Incognito` or `Private mode`.

Grep gates in `quality-gates.md`.

---

## Open questions / not-yet-decided

- Exact onboarding wow-animation approach (Lottie, Rive, Skia-based particles, or SVG). Decided in polish pass, not now.
- Peers sheet open behavior: bottom sheet vs full-screen modal. Lean bottom sheet consistent with workbench `Sheet`, validate with team lead.
- Whether to enable `/dev` catalog route on a production build or gate to dev builds only. Lean dev-only.
- Exact file location and format for Anonmesh logo variants (`@2x`, `@3x`, wordmark SVG). Set in screen-inventory.md / plan.
- Pre-existing tsc errors inherited from upstream (noble/hashes import paths in `src/gossip/`, `src/solana/`; `proxy_transfer_program/` nested web project). The `npx tsc --noEmit` gate in handoff.md is currently not clean. Phase 2+ agents must either (a) exclude `proxy_transfer_program/` from the expo tsconfig and fix noble paths when those files are touched, or (b) accept baseline errors and grep-diff against baseline count. Decide in-Phase-2.

Resolve these in-execution; update this section when decided.

---

## Recently locked (superseded open-questions)

- **2026-04-18 — D6 mesh status placement:** persistent slim band across all tabs. See D6 body for full spec and iteration clause.

---

## Supersedes

- ADR 0003's workbench-first lane is superseded for this branch. The parts that remain in force are the 3-tab IA, terminology lock, and the requirement that the product feel intentional rather than improvised.

## Related

- [recovery-plan.md](./recovery-plan.md)
- [architecture.md](./architecture.md)
- [screen-inventory.md](./screen-inventory.md)
- [implementation-plan.md](./implementation-plan.md)
- [quality-gates.md](./quality-gates.md)
- [progress.md](./progress.md)
- [lxmf-brief.md](./lxmf-brief.md)
- [handoff.md](./handoff.md)
- `../../anonmesh_mempool/docs/04-decisions/0004-v3-full-unification.md`
- `../../anonmesh_mempool/docs/04-decisions/0003-workbench-first-redesign-lane.md`
