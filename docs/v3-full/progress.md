# progress.md — v3-full live execution log

Append-only session log. Each session adds a block. Read this first when starting a session.

**Rules:** see `quality-gates.md` § "doc-update discipline".
- One block per session.
- Start entry: date, model, goal.
- End entry: what shipped, what drifted, open issues, handoff note.
- Keep tight. If a note is longer than a paragraph, extract the decision to `decisions.md`.

---

## Session template

Copy this block when starting a new session. Delete the template instructions once filled.

```markdown
## YYYY-MM-DD — session N

- **Model:** Opus 4.7 / Sonnet 4.6 / Haiku 4.5
- **Agent / human:** name or identifier
- **Goal:** one-line session goal

### Shipped

- bullet list of completed work; reference decision IDs where relevant
- commit SHAs optional but helpful

### Deviations from decisions.md

- list any deviation; reference the decision ID; explain why; note whether decisions.md was updated in the same commit

### Open issues

- bullet list of unresolved questions or blockers for next session
- tag each with a decision ID when relevant

### Handoff

- one-paragraph note for whoever picks this up next
- where to resume, what to read first, any surprises
```

---

## 2026-04-18 — session 1 (planning)

- **Model:** Opus 4.7
- **Agent / human:** Claude Code (this session) + @intern
- **Goal:** Produce a self-sufficient planning pack for v3-full on a clean branch off upstream/main.

### Shipped

- Created branch `v3-full` off `upstream/main`.
- Wrote planning docs in `docs/v3-full/`:
  - `README.md`
  - `decisions.md` (D1–D29)
  - `architecture.md`
  - `screen-inventory.md` (27 surfaces)
  - `quality-gates.md` (incl. testing approach)
  - `progress.md` (this file)
  - `implementation-plan.md` (7 phases, file-by-file)
  - `lxmf-brief.md` (self-contained parallel agent brief)
  - `handoff.md` (fresh-chat kickoff)
- Mempool ADR 0004 committed.
- Self-review pass: discovered workbench has a comprehensive `src/design-system/` tree (`foundation`, `semantic`, `component`, `state`, `motion`, `registry`) with full typed tokens. Updated D8, architecture folder tree, and Phase 0 steps in implementation-plan to **port the workbench design-system verbatim** rather than rebuild from primitives. Significantly de-risks Phase 0 execution.

### Deviations from decisions.md

- None. First session; decisions.md is ground truth.

### Open issues

- Mesh status strip placement: persistent band vs in-Home-header-only. Decided to lean in-Home-header-only; confirm in execution. (D6 / screen-inventory.md item 6)
- Peers surface form: bottom sheet vs full-screen modal. Lean bottom sheet via workbench `Sheet`. (D6)
- Whether to enable `/dev` route in production builds or `__DEV__`-gate. Lean `__DEV__`-gate. (screen-inventory.md item 27)
- Onboarding wow-animation technical approach (Lottie vs Rive vs Skia) — polish pass. (D17)
- Exact logo asset set to copy from v3 branch — do this in the first execution commit that adds `assets/brand/`.

### Handoff

Next session is the first execution session. Agent should:
1. Read `handoff.md` first.
2. Read `decisions.md`, `architecture.md`, `screen-inventory.md`, `implementation-plan.md`.
3. Read this file.
4. Start at step 1 of `implementation-plan.md`. Follow the plan; when a step requires a decision not in `decisions.md`, pause and update `decisions.md` before continuing.

Parallel LXMF agent (if running): see `lxmf-brief.md`, work in `../lxmf_react_native_rust/` repo. Not blocking this branch.

---

<!-- append future session blocks below -->

## 2026-04-18 — session 3 (phase 0/1 review + cleanup)

- **Model:** Opus 4.7
- **Agent / human:** Claude Code (review session) + @intern
- **Goal:** Verify Phase 0/1 are solid, resolve D6, clear blockers before Phase 2 kickoff.

### Shipped

- **Review:** Opus-driven code review of session-2 work against decisions.md, architecture.md, quality-gates.md. Verdict: READY-WITH-CAVEATS. All 27 claimed files present; 17 commits on v3-full match claimed SHAs.
- **Route cleanup:** deleted stale upstream routes that were actively competing with Phase 1 nav:
  - `app/(tabs)/index.tsx` (old ChatPage, broken layer imports)
  - `app/(tabs)/landing.tsx` (old IndexScreen)
  - `app/landing.tsx` (collides with new `app/index.tsx`)
  - `app/onboarding.tsx` (collides with `app/onboarding/` directory)
- **Workspace cleanup:** removed untracked `mobile_app/` dir (stale build artifact: only `android/`, `.expo/`, `node_modules/`, `expo-env.d.ts`; no source). Added to `.gitignore` if not already covered.
- **Decisions:** locked D6 (see decisions.md) — mesh status strip is a persistent slim band across all tabs with an explicit iteration clause. Updated screen-inventory.md item 6 and implementation-plan.md Steps 2.1 + 2.4 to match.

### Deviations from decisions.md

- D6 body rewritten in decisions.md (same commit as this progress update, per D20 discipline). Prior D6 left the placement as an open question with a lean; this session resolved it after user confirmation.

### Open issues

- **tsc baseline is not clean.** `npx tsc --noEmit` has ~45 pre-existing errors inherited from upstream/main:
  - `proxy_transfer_program/` — nested Vite/React-Router project pulling missing `@solana/wallet-adapter-*`, `react-router`, `@coral-xyz/anchor`, `bn.js`, chai, etc. Should be excluded from the expo tsconfig (it's a separate build unit), not fixed in-place.
  - `src/gossip/GCSFilter.ts`, `src/gossip/PacketIdUtil.ts`, `src/solana/SolanaTransactionManager.ts` — expect `@noble/hashes/sha2`. Upstream package path drift. Fix when those files are touched.
  - `components/screens/SolanaTransactionScreen.tsx:151` — wrong arg count.
  Phase 2 agent should either (a) land a one-liner tsconfig `"exclude": ["proxy_transfer_program/**"]` on the first Phase 2 commit and grep-diff remaining errors against baseline, or (b) pick a cleanup commit slot before Phase 2.1. Tracked as open question in decisions.md.
- **Layer-rule circumvention in `AdapterProvider.tsx`:** dynamic `require()` in `useMemo` bypasses ESLint static analysis. Acceptable for the fixture/real split but the two adapter module files (`src/fixtures/adapters.ts`, `src/infrastructure/adapters.ts`) are not covered by the layer rules. Low priority; revisit only if a layer violation slips through.
- **Lint warnings (10):** all in pre-existing upstream files (`components/screens/*`, `src/networking/bluetooth/*`) plus the two `AdapterProvider` dynamic requires. No errors. No Phase 0/1 regression.
- **Fixtures ownership:** Phase 2 agent authors `src/fixtures/{peers,conversations,transactions,presets}.ts` per implementation-plan Step 2.3. Do not pre-create.
- Asset gap: `assets/brand/` missing `@2x`/`@3x` logo variants and wordmark SVG. Defer — only visible on high-density displays.
- `GlassSurface` still has `ENABLE_BLUR = false` — flip after `npx expo prebuild`.

### Handoff

Phase 0 and Phase 1 are verified complete and clean. Next session is **Phase 2, Step 2.1** (Home shell + persistent MeshStatusStrip wired into `app/(tabs)/_layout.tsx`). Read decisions.md (esp. D6, D3, D19), the updated Step 2.1 in implementation-plan.md, and this progress block. First commit of Phase 2 should also land the tsconfig fix to exclude `proxy_transfer_program/` so the tsc gate becomes meaningful. Kickoff: paste the block in handoff.md verbatim; no Phase-2-specific appendix needed — the plan's Phase 2 section is self-contained.

---

## 2026-04-18 — session 2 (execution start)

- **Model:** Sonnet 4.6
- **Agent / human:** Claude Code (automated session)
- **Goal:** Execute Phase 0 (scaffolding) and Phase 1 (navigation shell) of implementation-plan.md

### Shipped

**Phase 0 — Scaffolding (complete)**
- Step 0.1: Folder skeleton (prior session)
- Step 0.2: Dependencies — added expo-blur, expo-linear-gradient, @gorhom/bottom-sheet, phosphor-react-native, expo-audio
- Step 0.3: Workbench design-system tokens ported verbatim (foundation, semantic, component, state, motion, registry, index)
- Step 0.4: useFonts hook (Space Grotesk, Manrope, JetBrains Mono — 12 faces)
- Step 0.5: GlassSurface primitive with 4 variants (regular/soft/accent/strong); glass.ts + useGlass.ts
- Step 0.6: All core primitives ported from workbench — DepthButton, Sheet, SlideToConfirm, NumericKeypad, BottomNav, Backdrop, Pill, SegmentedControl, AppTextInput, SectionLabel, SignalBars, Icon (with 6 custom SVG icons), primitives.tsx (22 exports)
- Step 0.7: sound.ts (expo-audio lazy engine), soundCatalog.ts (10 events), haptics.ts, motion.ts, theme.ts — all ported
- Step 0.8: anonmesh-logo.png ported from upstream/v3 → assets/brand/
- Step 0.9: Custom mesh icons implemented in Icon.tsx (mesh-nodes, signal, identity-chip, beacon, lock-mesh, stealth)
- Step 0.10: ESLint layer import-direction rules (components→infra blocked, hooks→components/infra blocked, domain→all blocked)
- Step 0.11: Provider skeletons — AdapterProvider (real/fixture), ThemeProvider, WalletProvider, MeshProvider
- Step 0.12: Domain entities (Peer, Identity, Wallet, Transaction, Message), service interfaces (5), TransferStatus lock

**Phase 1 — Navigation shell (complete)**
- Step 1.1: app/_layout.tsx — GestureHandlerRootView + SafeAreaProvider + 4 providers + Stack + StatusBar
- Step 1.2: app/index.tsx landing + components/onboarding/LandingCanvas.tsx (SVG ambient glow background)
- Step 1.3: app/onboarding/welcome.tsx + FeatureHighlight.tsx — 4 feature cards, GET STARTED CTA, tech link
- Step 1.4: app/onboarding/setup.tsx + PermissionPrimer.tsx + WalletPathPicker.tsx — alias, permissions, wallet path
- Step 1.5: app/onboarding/tech-drawer.tsx + TechDrawerContent.tsx — 4 sections, modal layout
- Step 1.6: app/(tabs)/_layout.tsx — expo-router Tabs + custom BottomNav tabBar adapter
- Step 1.7: app/(tabs)/{home,messages,settings}.tsx — empty screens with Backdrop variants

Commits: 60a08d8, 090d483, 883f66d (Phase 1); a97d173, b56a066, ec6c81f (Phase 0 tail)

### Deviations from decisions.md

- Step 0.4 deviation: fonts kept in `components/fonts/` (workbench canonical location) rather than `assets/fonts/` as plan spec'd. Reason: workbench `useWorkbenchFonts.ts` uses `@/components/fonts/` paths; moving them would require rewriting import paths. Low-risk, aligns with existing convention.
- `.expo/types/router.d.ts` hand-updated with new routes (normally regenerated by `expo start`). Types were manually extended to include `/onboarding/welcome`, `/onboarding/setup`, `/onboarding/tech-drawer`, `/(tabs)/home`, `/(tabs)/messages`, `/(tabs)/settings`. File is gitignored; will auto-regenerate on next `expo start`.

### Open issues

- `GlassSurface` ENABLE_BLUR flag is `false` — flip after `npx expo prebuild` when expo-blur native module is available.
- `AdapterProvider` real adapters (src/infrastructure/adapters.ts) are stubs that throw. Phase 4+ will implement real BLE/Solana adapters.
- Tab layout has old `app/(tabs)/index.tsx` and `app/(tabs)/landing.tsx` from upstream still present — these won't be navigated to in v3-full flow but may confuse expo-router. Consider deleting in Phase 2.

### Handoff

Phase 0 and Phase 1 are complete. Next session resumes at **Phase 2 — Home tab + Send flow + Peers** (implementation-plan.md line ~485). Start with Step 2.1 (Home shell): HomeHero, BalanceCard, MeshStatusStrip, RecentActivity, action row. Read decisions.md D3/D6/D19 before touching Home layout. The tab screens at app/(tabs)/home.tsx are currently empty placeholders — Phase 2 fills them in.

---

## 2026-04-18 — session 4 (Phase 2 execution)

- **Model:** Sonnet 4.6
- **Agent / human:** Claude Code (subagent-driven execution) + @intern
- **Goal:** Execute Phase 2 end-to-end — Home shell, MeshStatusStrip, hooks, fixtures, peers, send flow, receive, history.

### Shipped

<!-- filled at session end -->

### Deviations from decisions.md

<!-- filled at session end -->

### Open issues

<!-- filled at session end -->

### Handoff

<!-- filled at session end -->
