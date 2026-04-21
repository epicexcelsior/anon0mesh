# recovery-plan.md — v3-full reset and execution plan

**Status:** active recovery plan
**Date:** 2026-04-20
**Driver:** user-approved reset after audit of `v3-full`

## Purpose

`v3-full` is not a lost cause, but it is off contract in two important ways:

1. it followed the workbench branch as the primary visual canon
2. several critical flows are only partially implemented or are wired incorrectly

This document defines the recovery path so implementation resumes from one clear contract instead of another round of drift.

## Scope call

This is **not** the best handled as a full greenfield rewrite.

This is also **not** a small polish pass.

Best description: **structured recovery plus targeted screen rebuilds**.

What stays:

- `v3-full` branch as the integration lane
- Expo Router app structure
- adapter/provider architecture
- most domain entities and service seams
- much of the existing screen routing

What changes materially:

- visual source of truth
- token mapping and component styling discipline
- high-visibility screen composition
- broken or fake interaction paths
- parts of backend/UI state wiring

## Recommended ownership model

Use **one primary agent / owner** through the reset, foundation repair, and first major screen wave.

Reason:

- design canon is changing
- screen hierarchy needs consistent taste across surfaces
- multiple agents now would optimize for local correctness while increasing global drift

Parallel agents only make sense **after** the reset is codified and the write scopes are narrow. Good sidecar work later:

- transaction status polling + explorer wiring
- message state persistence
- settings persistence
- test/QA sweeps

## New source precedence

Going forward, use this precedence for `v3-full` recovery:

1. **Visual system / taste / tokens / component feel:** `worktrees/anon0mesh-fork-ui` (`feature/ui-redesign`, Void Protocol)
2. **Information architecture / screen content / product contract:** wireframe, Stitch-derived docs, `docs/v3-full/screen-inventory.md`
3. **Architecture / adapters / backend seams:** current `v3-full`
4. **Workbench branch:** reference only when it still aligns with the redesign direction and does not conflict with item 1

This means the prior "workbench wins design language" assumption must be treated as stale before major implementation continues.

## Recovery phases

### Phase 0 — Reset the contract

Goal: make docs truthful before more code lands.

Deliverables:

- update `docs/v3-full/README.md` source summary
- update `docs/v3-full/decisions.md` to replace workbench-first visual precedence with redesign-first precedence
- update `docs/v3-full/screen-inventory.md` source columns where visual ownership changed
- add a concise progress entry documenting the reset

Exit criteria:

- a fresh agent could read the docs and choose the right visual source without guessing

### Phase 1 — Fix hard functional regressions first

Goal: remove obvious brokenness before visual rebuilds.

Must-fix items:

- peer actions use correct identifier type (`publicKey` vs `peer.id`)
- mesh hooks become reactive instead of fetch-once
- message send path updates local/UI state immediately
- transaction flow drives real status progression where possible
- explorer/share actions stop dead-ending when data already exists
- settings screens stop pretending local toggles are wired when they are not

Exit criteria:

- peer/message/send/status flows no longer fail or silently no-op

### Phase 2 — Reconcile design system cleanly

Goal: make `src/design-system/` reflect the approved redesign, not a hybrid accident.

Options:

- map Void Protocol into existing `src/design-system/` contracts, preferred
- only replace token values where structure already works
- rebuild primitives only where current workbench-derived primitives cannot express the redesign cleanly

Rules:

- do not introduce a second parallel token system in active app code
- no `VP` tokens in one lane and `appTheme` tokens in another
- reduce hardcoded active-shell values as part of this pass

Exit criteria:

- one active token system
- one active primitive grammar
- no ambiguity about which component family is canonical

### Phase 3 — Rebuild core screens in priority order

Goal: restore product quality where users feel it first.

Priority order:

1. Home
2. Send flow
3. Messages + conversation
4. Peers surfaces
5. Settings

Per-screen rule:

- pull layout and taste from redesign canon
- pull information requirements from wireframe / screen inventory
- preserve valid backend seams from `v3-full`

Exit criteria:

- top-level product story reads correctly in 5 seconds
- Send and Messages feel authored, not merely styled

### Phase 4 — Backend truth pass

Goal: close gap between UI promise and actual behavior.

Focus:

- wallet history and transaction detail truth
- confirmation polling / status updates
- MWA edge cases and visible error handling
- BLE/peer state UX accuracy
- preference persistence for privacy/network settings

Exit criteria:

- no major screen advertises a capability that is merely local-state theater unless explicitly labeled as stub

### Phase 5 — Final polish and acceptance

Goal: achieve stable, reviewable quality.

Checks:

- visual consistency sweep
- copy and terminology lock
- empty/loading/error states
- Android device QA
- lint / typecheck baseline re-verified
- remaining warnings triaged

Exit criteria:

- branch is internally coherent
- product feels intentional
- manual walkthrough does not expose dead controls or fake affordances

## Done definition

The recovery is done when all are true:

- design canon is single-source and documented
- tokens are unified
- Home, Send, Messages, Peers, Settings all match the redesign direction
- broken flows are fixed
- stubbed areas are either implemented or explicitly framed as not yet live
- no obvious "looks built by two different models" seams remain

## Immediate next actions

1. continue Phase 3 after Home + Send + Messages with the Peers surfaces rebuild
2. then rebuild Settings in recovery order
3. keep the messaging runtime notes truthful while Peers/Settings land around it
4. keep the canonical docs and build-around language aligned as each screen wave lands

## Notes on ambition

This is a **medium-large recovery**.

It is ambitious enough that it benefits from a written execution contract.

It is **not** so large that a separate master agent is required right now, as long as one owner keeps the reset, implementation, and QA tightly coupled.
