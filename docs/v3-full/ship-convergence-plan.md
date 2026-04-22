# ship-convergence-plan.md — v3-full recovery-to-ship plan

**Status:** locked
**Freshness:** fresh
**Last verified:** 2026-04-21 (user confirmed scope, cadence, and phases)
**Owner:** current execution lane
**Canonical:** yes — this is the only live ship doc. Older docs moved to `archive/`.

This document exists for one reason: stop wheel-spinning and force `v3-full` to converge into a tester-ready MVP quickly.

It is intentionally opinionated.

Companion live docs (do not duplicate):

- `screen-inventory.md` — surface contract (per-screen ownership, routing, data)
- `decisions.md` — durable product/design decisions log
- `architecture.md` — technical architecture reference

Everything else in `archive/` is historical. Do not follow it.

## 0. Audit coverage for this decision

This plan is based on direct review in this session of:

- local `anon0mesh` `v3-full`
- remote `origin/v3-full`
- fresh `upstream/v3` worktree at `/home/epic/Downloads/anonmesh/anon0mesh-v3-latest/mobile_app`
- redesign worktree at `/home/epic/Downloads/anonmesh/worktrees/anon0mesh-fork-ui`
- mempool docs:
  - `anonmesh_mempool/CONTEXT.md`
  - `anonmesh_mempool/docs/00-governance/command-center.md`
  - `anonmesh_mempool/docs/02-repos/mobile-app.md`
  - `anonmesh_mempool/docs/04-decisions/0003-workbench-first-redesign-lane.md`

Files/areas explicitly checked:

- `docs/v3-full/{handoff,recovery-plan,progress,decisions,screen-inventory}.md`
- fresh `v3` routes:
  - `app/(tabs)/wallet.tsx`
  - `app/(tabs)/settings.tsx`
  - `app/(tabs)/index.tsx`
  - `app/(tabs)/nodes.tsx`
- fresh `v3` component systems:
  - `components/wallet/*`
  - `components/settings/*`
  - `components/messages/*`
  - `components/nodes/*`
- fresh `v3` runtime contexts:
  - `context/WalletContext.tsx`
  - `context/LxmfContext.tsx`
- redesign worktree context:
  - `CONTEXT.md`
  - `PLAN.md`

What this plan **does** claim:

- enough key sources were reviewed to make source-precedence and execution-order decisions safely
- branch-role decision here is evidence-backed
- tonight's execution order is materially better than current ad-hoc loop

What this plan **does not** claim:

- every file in every related repo has been exhaustively read
- every transport/runtime edge path is fully audited
- fresh `v3` is production-ready as-is
- stealth / beacon / settlement are fully ready to ship

## 1. Brutal diagnosis

The project has been losing time for structural reasons, not because one more prompt or one more polish pass would magically fix it.

What is actually going wrong:

1. We have been mixing **three different canons** at once:
   - `v3-full` as the integration/runtime lane
   - `ui-redesign` / workbench as a design/tokens lane
   - fresh `v3` as a more information-complete product/UI lane
2. We have been trying to solve **visual design, information architecture, and backend truth** simultaneously on the same screens.
3. The iteration loop has been too slow:
   - unstable native/dev-client state
   - unclear reference screens
   - too much editing before physical-device review
4. `v3-full` has better branch shape for final product structure, but the newer `v3` lane is currently stronger in several screen directions:
   - wallet information density
   - settings information grouping
   - message-thread interaction patterns
   - peer/network visibility
5. A full base switch to `v3` tonight is the wrong move:
   - it is still a 4-tab app
   - it is not normie-friendly enough on its own
   - it does not build cleanly out of the box without patching the LXMF Android package
   - it still needs functionality cleanup and polish
6. Some existing context sources are stale:
   - mempool still carries older workbench-first assumptions
   - workbench docs/context still describe a 4-tab `v2`-based redesign lane
   - repo READMEs overstate stealth/production readiness

Bottom line:

- `v3-full` stays the implementation base.
- fresh `v3` becomes the primary reference for screen information and stronger UI patterns.
- workbench / redesign lane gets demoted to **tokens, surfaces, and reusable taste**, not whole-screen truth.

## 2. New source-of-truth order

For the remainder of this push, use this order:

1. **Implementation base and final shipping branch:** `anon0mesh` `v3-full`
2. **Reference for better wallet/settings/messages/nodes content and stronger current UI direction:** `/home/epic/Downloads/anonmesh/anon0mesh-v3-latest/mobile_app`
3. **Product contract and route remap into 3 tabs:** `docs/v3-full/screen-inventory.md`
4. **Reusable token/style inspiration only:** redesign/workbench lane

This is the core correction.

Do **not** keep treating the workbench lane as the full visual owner if fresh `v3` is clearly giving better results on actual screens.

Durable pieces still worth preserving from redesign/workbench:

- Seeker/AMOLED device target
- touch-first spacing discipline
- palette/typography intent
- semantic cyan/purple restraint
- terminology lock
- useful primitives and motion where they still fit

## 3. Non-negotiable execution rules

From now until tester MVP is ready:

1. No more open-ended redesign generation.
2. No more trying to improve all screens at once.
3. No more fake affordances unless explicitly labeled preview/staged.
4. No more major screen work without device screenshots.
5. No more unclear source ownership for a screen.
6. No base switch for the duration of this push — `v3-full` stays the ship base.
7. No new tools, MCPs, libraries, or animation systems added during this push. Work inside what already exists.
8. No timelines baked into phases. Phases are sequential, not time-boxed. Quality bar never lowers because of the clock.
9. No new docs. Append to this doc or `screen-inventory.md` instead.

## 3.1. Review cadence (hard-stop checkpoints)

The user has removed themselves from the loop too late too often. Fix:

1. **Every phase exits with a device screenshot or short video.** No exceptions.
2. **User reviews on physical Seeker (or Android) before the phase is marked complete.** Simulator is not a substitute.
3. **No phase N+1 work starts until phase N is user-approved.** Even if the agent is "almost done with the next thing."
4. **Agent commits at phase boundaries, not mid-phase.** User can diff cleanly.
5. **If agent drifts into speculative work, user interrupts immediately.** Agent rolls back drift and reports.
6. **One screen per commit when possible. One runtime seam per commit when possible.**

## 3.2. Quality bar

The target is **"clearly intentional, zero low-effort tells, materially better than both `v3-full` and `v3-latest` on every screen."**

The target is not literal Umbra parity. Umbra is a team of 10+ full-time designers over 12+ months. Scoring against Umbra during this push guarantees we never ship. Umbra-level polish is a post-ship iteration arc.

If a screen clearly beats its current-branch counterpart and has no obvious cheap tells (clipping, misaligned rhythm, inconsistent primitives, fake toggles), it ships.

## 4. What we are actually shipping

We are **not** shipping every dream feature.

We are shipping a tester MVP that feels intentional, is normie-readable, and is honest about what is live.

That means:

- polished 3-tab shell
- coherent Home / Messages / Settings
- accurate wallet identity/balance/send/receive/history surfaces
- accurate peer/mesh visibility
- real-enough onboarding and settings persistence
- honest labeling for staged features such as stealth settlement, beacon staking, and unfinished LXMF paths

## 5. Route convergence map

Fresh `v3` has good pieces, but `v3-full` must remain a 3-tab app.

Route remap:

- `v3` `wallet` -> `v3-full` Home + Send + Receive + History
- `v3` `index/messages thread` -> `v3-full` Messages
- `v3` `nodes` -> `v3-full` mesh status strip + peers sheet/detail + network/beacon surfaces
- `v3` `settings` -> `v3-full` Settings home + identity/network/privacy/beacon/about routes

## 6. Screen ownership for this push

### Home

Primary reference:

- fresh `v3` wallet screen for information density, portfolio framing, quick actions, hierarchy

Keep from `v3-full`:

- 3-tab shell
- adapter/provider hooks
- send/receive/history route structure
- honest runtime-truth constraints

Must be true when done:

- top of Home reads clearly in 5 seconds
- balance / identity / actions / recent activity do not fight each other
- mesh info is visible but does not overpower wallet trust
- no clipped text, no giant dead glass slabs, no redundant labels

### Messages

Primary reference:

- fresh `v3` thread, header, drawer, and composer interaction pattern

Keep from `v3-full`:

- route shape
- staging/honesty around delivery truth
- existing provider seams

Must be true when done:

- thread feels like a real messaging product, not a placeholder
- new conversation flow is obvious
- peer context is visible
- empty/loading/error states are authored

### Settings

Primary reference:

- fresh `v3` settings sectioning, identity card, hardware/network grouping

Keep from `v3-full`:

- sub-route structure
- truthful gating for export / wallet path / staged privacy features
- local persistence and runtime truth

Must be true when done:

- identity, network, privacy, beacon, and about feel like one system
- no overpacked cards
- no long overflow strings
- no misleading toggles

## 7. Functional truth priorities

After the shell/screens are visually corrected, wire truth in this order:

1. wallet identity / balance / recent activity / tx detail
2. send review / send success / receive / share / explorer
3. mesh strip / peers / last-seen / live connection state
4. settings persistence and honest capability gating
5. messaging transport status and queue truth

Do **not** spend tonight building:

- full stealth settlement
- full beacon staking
- speculative new wallet systems
- large new navigation concepts

If a feature is not live, it must be obviously staged.

## 8. Execution phases (sequential, no timelines)

These replace the prior Phase A–D timeline. Phases are gated by user device review, not by clock.

### Phase 0 — Alignment + archive (complete when user green-lights commit)

Deliverables:

- 7 stale docs moved to `docs/v3-full/archive/`
- live docs: `ship-convergence-plan.md`, `screen-inventory.md`, `decisions.md`, `architecture.md`
- this plan locked with Phase 0–8 + review cadence + quality bar
- memory updated: workbench-first retired; review-cadence rule added

Exit:

- user approves archive + plan; staged changes commit-ready (not yet committed)

### Phase 1 — Primitive + haptic consistency pass

Pure consistency sweep. No visual rewrites yet.

Deliverables:

- audit every `Pressable` / `TouchableOpacity` / `Button` across in-scope screens (onboarding, Home, Messages, Settings, Send, Peers sheet)
- route through `DepthButton`, `SlideToConfirm`, or designated pressable primitive
- wire `haptics.ts` on every interactive element (tap / select / confirm / warning / error tiers)
- lock motion tokens into the three shared molecules: button press, sheet open/close, slider threshold
- short on-device video of one button press + one sheet open for user feel-review

Exit:

- user green-lights the feel before any screen rebuild starts

### Phase 2 — Onboarding

Deliverables:

- polish current v3-full onboarding copy + layout using locked primitives
- optional "How it works" reveal as a `Sheet`, not a route (reticulum / LXMF / BLE / Arcium summary, unforced)
- permission priming cards with *reason copy* (Bluetooth, Notifications); no OS dialog fires from onboarding
- minimal-focus style pass; zero density issues on Seeker

Exit:

- on-device screenshot of each step reviewed by user

### Phase 3 — Home

Deliverables:

- header (identity chip + QR) + mesh strip + wallet hero (SOL/USD) + primary actions + segmented balance/history + recent activity
- v3-latest wallet portfolio/allocation cell absorbed (not forked)
- no stealth/beacon on Home

Exit:

- on-device side-by-side vs v3-latest Home reviewed by user

### Phase 4 — Messages

Deliverables:

- list + thread via primitives
- fixture-backed, honestly labeled (Queued on device / Handed to mesh / Settled)
- v3-latest PeersDrawer pattern for new-conversation picker
- authored empty / loading / error states

Exit:

- on-device screenshot reviewed by user

### Phase 5 — Settings

Deliverables:

- sectioned (identity / network / privacy / beacon-preview / about)
- no fake toggles; beacon preview explicitly labeled
- wallet export modal behind biometric gate

Exit:

- on-device screenshot reviewed by user

### Phase 6 — Peers sheet

Deliverables:

- sheet from mesh-strip tap
- v3-latest peer-row density + real `usePeers` hook
- per-peer actions (message, send payment)
- empty state copy

Exit:

- on-device screenshot reviewed by user

### Phase 7 — Runtime truth wiring

Only now. Order:

1. Wallet identity / balance / recent activity / tx detail
2. Send review / success / receive / share / explorer
3. Mesh strip / peers / last-seen / live connection state
4. Settings persistence + honest capability gating
5. Messaging transport + queue truth (cherry-pick v3-latest `@magicred-1/react-native-lxmf` BLE integration)

Preserve truthful staging for stealth / beacon throughout.

Exit:

- real SOL transfer sent and settled on device; peer list reflects live mesh state

### Phase 8 — Ship gate

Required:

- `npx tsc --noEmit` clean
- lint clean
- `expo prebuild --clean` + Android build clean on Seeker
- full walkthrough video recorded on Seeker
- PR opened against teammate review

Exit:

- PR open, user ready to send to teammates / testers

## 9. Workflow that will actually move faster

Use this loop, not ad-hoc prompting:

1. Pick one screen.
2. Read the winning reference screen and current implementation.
3. Write down the exact visual/information defects.
4. Patch only that screen and directly adjacent primitives.
5. Run on device.
6. Capture screenshot.
7. Judge against reference.
8. Repeat once or twice max.
9. Move on.

Rules:

- one screen per commit when possible
- one runtime seam per commit when possible
- do not stack five unrelated UI ideas before checking device output

## 10. Branch and tooling strategy

Keep:

- `v3-full` as shipping lane
- `anon0mesh-v3-latest/mobile_app` as read-only comparison/reference lane

Use fixture mode when:

- shaping layout
- testing empty/loading states
- stabilizing visual rhythm

Use real adapter/native lane when:

- validating send/receive/history truth
- validating mesh peer state
- validating wallet/export/settings gating

Important note:

fresh `v3` currently required local patching in the LXMF Android package to build on this machine. That confirms it is a **reference lane**, not a safe switch-over base tonight.

## 10.1. Stale-source warning

Do not follow these blindly:

- mempool ADR 0003 workbench-first framing
- older workbench assumptions about 4-tab final IA
- stale README claims implying stealth / beacon / transport paths are already production-ready
- any assumption that fresh `v3` is zero-friction to build natively without local repair

## 11. Definition of ship-ready

Tester-ready MVP is successful if all of this is true:

1. Onboarding, Home, Messages, Settings, Peers sheet look materially better than both current `v3-full` AND `v3-latest`.
2. Those screens are visually coherent with each other — one system, not five.
3. Primitive + haptic consistency is complete: every pressable routes through a designed primitive, every interaction fires an appropriate haptic tier.
4. Wallet / send / receive / history are truthful enough for testers to trust.
5. Peer / mesh state is visible and not misleading.
6. Settings is not cooked, clipped, or fake. Preview features are labeled.
7. The app installs, launches, and can be walked end-to-end on physical Seeker.
8. Remaining unfinished features are explicitly staged, not accidentally implied.
9. Typecheck + lint + Android build clean.

## 11.1. Frozen decisions (user-confirmed 2026-04-21)

| Question | Answer |
|---|---|
| Ship base | `v3-full` (locked) |
| Primary reference for information + layout | `upstream/v3` (teammate canonical, `anonmesh/mobile_app` repo, HEAD `2dd5437`) — materialized locally as the `v3-latest` branch in `anon0mesh-v3-latest/mobile_app` (user's fork, 1 theme-fix commit ahead). Builds on Seeker per user. |
| Secondary reference for style / tokens / design system | workbench lane (demoted — tokens only, not whole screens) |
| Must-demo flows | onboarding, Home wallet, send/receive/history, messages thread, peers/mesh, settings |
| Beacon / stealth | staged / preview-labeled; no real flow this push |
| Onboarding scope | polish current + optional "How it works" reveal + permission priming with reasons |
| AI video onboarding | deferred — post-ship polish, not this push |
| Pigeon animation | deferred |
| Haptics | outstanding haptic feel across every primitive is a ship-blocker; lock via shared haptic tokens + primitives |
| Token playground (`/dev/tokens` with sliders) | skipped for now; 15-min read-only swatch preview optional, user to decide |
| Scope limit per phase | one phase, one review gate, no batching |
| New tools / MCPs | none this push |

## 11.2. Known stale sources (do not follow)

- mempool ADR 0003 (workbench-first framing — retired by this plan)
- mempool `CONTEXT.md` and `mobile-app.md` (dated 2026-04-16, still describe `epic/ui-workbench-fixtures` as the active lane)
- workbench docs framing 4-tab IA as final
- repo READMEs implying stealth / beacon / transport are production-ready
- memory entry `feedback_workbench_target.md` pre-update (workbench-first was right then; retired now)

## 12. Immediate next move

Phase 0 deliverables are staged. Pending user green-light to commit, then Phase 1 (primitive + haptic audit) begins.

After Phase 1 exits user feel-review, Phase 2 (onboarding) starts. No phase skipping. No batching.

This plan intentionally rejects more ideation.

The problem is not lack of ideas.

The problem is lack of a frozen convergence path — now frozen.
