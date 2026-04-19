# decisions.md — v3-full living decision ledger

**Last updated:** 2026-04-18 (Phase 0/1 review — D6 locked, tsc baseline flagged)
**Status:** active
**Owner:** @intern (team lead reviews)

This is the authoritative ledger. When you deviate, update this doc in the same commit as the deviation. See `quality-gates.md` § "doc discipline".

Decisions are prefixed `D#`. Cross-reference by ID in commits and `progress.md`.

---

## Motivation

Three parallel UI tracks exist:

- **Workbench** (`epic/ui-workbench-fixtures`) — polished design system, 5 preview screens, fixtures, motion/sound/haptics. Anchored to ADR 0003 (3-tab IA, workbench-first review, locked terminology).
- **v3 branch** (`upstream/v3`) — real engineering: components extracted by domain, BeaconRegistry, PeersDrawer new-conversation flow, wallet infra. `mobile_app/` subfolder restructure. 4-tab IA.
- **Claude Design wireframe** (`anonmesh_ui_ux/` static HTML+JSX) — rich information architecture, copy, mesh-terminal aesthetic, 4-screen sketch.

The team needs one production-grade MVP. This effort merges the three into a single coherent branch anchored to the workbench design language, filled in with v3-branch content and real engineering, with wireframe as copy/pattern reference.

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

**D8. Token storage.** Port the existing workbench tree at `src/design-system/tokens/` verbatim, preserving file names. Files: `foundation.ts` (palette, spacing, radius, type scale, fonts), `semantic.ts` (semantic color tokens, shadow), `component.ts`, `state.ts` (depth, feedback), `motion.ts`, `registry.ts`, `index.ts` barrel. Keep the path `src/design-system/` for zero-rename port. **No CSS** — React Native cannot load CSS at runtime; the wireframe's `styles.css` is a source reference only, ported to TS where tokens are missing (glass variants). Rationale: industry standard for Expo/RN apps; type safety; reuses the extensive token registry already built in the workbench.

**D9. Token source merge rules.**

| Token family | Primary source | Fill gaps from |
|---|---|---|
| Colors / semantic palette | Workbench (cyan active, amber queued, green settled, purple stealth, red destructive) | v3 `theme/colors.ts` for surfaces/borders, wireframe green only for mesh surfaces |
| Typography | Workbench (Space Grotesk + Manrope) + wireframe (JetBrains Mono for hashes/IDs/signals) — 3 fonts total | — |
| Spacing | Workbench `theme.spacing` | v3 `theme/spacing.ts` |
| Motion | Workbench `motion.ts` (overdamped, no bounce) | — |
| Depth | Workbench `theme.depth` + `DepthButton` morphic press | — |
| Sound | Workbench `soundCatalog.ts` + 6 WAVs | — |
| Glass surfaces | **Wireframe 4 variants** (`glass`, `glass-soft`, `glass-accent`, `glass-strong`) ported to TS factory/hook | Workbench `useGlass` replaced by richer 4-variant API |
| Radius | Workbench `theme.radius` | — |
| Haptics | Workbench | — |

**D10. Mesh-terminal aesthetic weight.** Restrained. Scanlines, blink caret, heavy mono = confined to mesh/diagnostic surfaces (mesh status strip, peer list technical rows, beacon signatures). Wallet, Send, Messages = workbench trust-forward calm. Rationale: wireframe leans hard cyberpunk; user prefers wallet/payment critical moments feel quiet and solid.

**D11. Tab bar style.** Flush glass-strong at bottom, safe-area-padded. Keep workbench's larger active-tab highlight and sliding animation behavior. Not floating. Rationale: floating tab bars read as imitation of other apps; flush + glass looks intentional on top of our content.

**D12. Palette.** Workbench semantic wins. Actual values (verified against workbench `src/design-system/tokens/foundation.ts` + `semantic.ts`):

```
background       palette.obsidian950 (#0A0B0D)
backgroundSoft   palette.obsidian900 (#0d0e10)
backgroundRaised palette.obsidian850 (#131416)
surface          palette.obsidian800 (#161718)
surfaceMuted     palette.obsidian775 (#1b1c1e)
surfaceElevated  palette.obsidian750 (#1f2022)
textPrimary      palette.frost50 (#f3f7fa)
cyan             palette.cyan500 (#00daf3)   — active, selection, links
amber            palette.amber500 (#ffbf00)  — queued / handoff
green            palette.green500 (#3ce36a)  — settled / mesh-connected
purple           palette.purple500 (#8b5fbf) — stealth
red              palette.red500 (#cc6666)    — destructive
```

Plus per-semantic soft/glow variants already defined in workbench `semantic.ts`. Port verbatim.

**D13. Workbench polish preservation.** `motion.ts`, `soundCatalog.ts` + WAVs, haptics, `DepthButton`, `SlideToConfirm` (with shadow-twin trick for no-Skia), `WorkbenchSheet` (renamed `Sheet`), the terminology lock. Port incrementally alongside each screen to avoid a "we'll add polish later" trap that loses polish. See `quality-gates.md` § "polish discipline".

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

**D28. Quality bar.** "No shortcuts. Polish after full screen coverage is fine, but it should be clearly based on workbench existing work." Concretely:

- Pass 1: port every surface with design language + content mapped correctly, motion + haptics + sound placeholders wired.
- Pass 2: polish alignment, spacing, consistency, edge states.
- No redesign loops. If something feels wrong, check the workbench + decisions.md first before altering.

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

- ADR 0003 § "workbench-first → teammate review → live-app port" is partially superseded: the workbench becomes the live app on this branch, skipping the separate port step. The 3-tab IA, terminology lock, and visual/motion guardrails from ADR 0003 remain in force.

## Related

- [architecture.md](./architecture.md)
- [screen-inventory.md](./screen-inventory.md)
- [implementation-plan.md](./implementation-plan.md)
- [quality-gates.md](./quality-gates.md)
- [progress.md](./progress.md)
- [lxmf-brief.md](./lxmf-brief.md)
- [handoff.md](./handoff.md)
- `../../anonmesh_mempool/docs/04-decisions/0004-v3-full-unification.md`
- `../../anonmesh_mempool/docs/04-decisions/0003-workbench-first-redesign-lane.md`
