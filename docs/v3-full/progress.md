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
