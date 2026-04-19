# handoff.md — v3-full execution kickoff

Use this when starting a fresh chat / session for execution. Copy the "Kickoff prompt" section into the new session verbatim.

## Kickoff prompt (paste this into a fresh chat)

```
You are picking up execution of the `v3-full` effort on the `anon0mesh` repo.

Branch: v3-full (currently at upstream/main).
Repo: /home/epic/Downloads/anonmesh/anon0mesh
Planning folder: docs/v3-full/

Required reading before any action, in order:

1. docs/v3-full/README.md — orientation
2. docs/v3-full/decisions.md — the ledger (D1–D29). Treat as contract.
3. docs/v3-full/architecture.md — layer rules, folder structure, import direction
4. docs/v3-full/screen-inventory.md — every surface in scope
5. docs/v3-full/implementation-plan.md — step-by-step execution
6. docs/v3-full/quality-gates.md — commit discipline, grep locks, polish rules
7. docs/v3-full/progress.md — read every prior session block before starting

After reading, follow these rules:

- Start at the next unfinished step in implementation-plan.md.
- Open progress.md. Append a new session block: date, model, goal.
- Use TodoWrite (or the task tool) to track work per step.
- Commit after each step (or logical group) with conventional messages referencing decision IDs where relevant.
- If you need a decision not covered in decisions.md, pause, update decisions.md, commit the doc update, then resume.
- Never silently deviate from decisions.md. Updating it in the same commit as the deviation is mandatory.
- Run `npm run lint` and `npx tsc --noEmit` before every commit.
- If a problem requires architectural judgment beyond the plan, escalate: write the issue as a progress.md open-issue block and pause.
- At session end, fill in the "Shipped / Deviations / Open issues / Handoff" fields of your progress.md block.

Model guidance:
- Sonnet 4.6 is the expected execution model. Use it unless you hit an escalation condition.
- Opus 4.7 is reserved for architectural judgment and code review.
- Do not use Haiku 4.5 for polish-heavy work on this branch.

First action: read the required reading. Then review progress.md. Then claim the next step from implementation-plan.md.

Do NOT start writing code until you have read docs/v3-full/decisions.md and docs/v3-full/architecture.md end to end.
```

## Phase-specific notes

### Starting Phase 2 (first execution session after scaffolding)

Pasting the kickoff prompt above is sufficient. The plan's Phase 2 section is self-contained. Additional context the Phase 2 agent should know on day one:

- **D6 is locked** (2026-04-18 session 3): mesh status strip is a persistent slim band across every tab, implemented in `app/(tabs)/_layout.tsx` above the Stack/Slot. See decisions.md D6 body + screen-inventory.md item 6 + implementation-plan.md Step 2.1 for the locked spec.
- **First Phase 2 commit should also fix the tsc baseline** — add `"exclude": ["proxy_transfer_program/**"]` to `tsconfig.json`. Without this, `npx tsc --noEmit` will keep reporting ~40 errors from a nested Vite project that is not part of the expo build. Details in progress.md session 3 open issues.
- **Fixtures are yours to write** per Step 2.3 (`src/fixtures/{peers,conversations,transactions,presets}.ts`). They were intentionally not pre-created.
- **Routes are clean** — all stale upstream routes were deleted in session 3. `app/` contains only: `index.tsx`, `_layout.tsx`, `onboarding/`, `(tabs)/`. Anything else in `app/` before Phase 2 work starts means someone else is touching the branch.

## Context budget

The planning folder is comprehensive but not huge (~2000 lines total). Load on demand:

- Always load: `decisions.md`, `architecture.md`, `progress.md`, current step in `implementation-plan.md`.
- Load when needed: `screen-inventory.md` (when on a specific surface), `quality-gates.md` (when committing or grepping), `lxmf-brief.md` (only if you become the LXMF agent), `handoff.md` (just this file; low value after kickoff).

## External context

You may need to reference (out-of-tree):

- Workbench design system docs: `docs/ui-system/` on `epic/ui-workbench-fixtures` branch. Use `git show epic/ui-workbench-fixtures:docs/ui-system/<file>` or `git worktree add` to mount.
- v3 branch `mobile_app/` for code to port: `git show upstream/v3:mobile_app/<path>` or `git checkout upstream/v3 -- mobile_app/<path>`.
- Wireframe: `/home/epic/Downloads/Telegram Desktop/anonmesh_ui_ux/` — reference only.
- Stitch screen map: `/home/epic/Downloads/anonmesh/design/SCREEN_MAP.md`.
- Mempool: `/home/epic/Downloads/anonmesh/anonmesh_mempool/` — ADR 0003, ADR 0004, repo profile, CONTEXT.md.
- LXMF repo: `/home/epic/Downloads/anonmesh/lxmf_react_native_rust/`.

## Commands you'll use

```bash
# inspect branches
git branch -a
git log --oneline -20

# pull a file from another branch without switching
git show epic/ui-workbench-fixtures:components/dev/workbench/motion.ts
git checkout upstream/v3 -- mobile_app/src/infrastructure/wallet/MWA/MWAWalletAdapter.ts

# run the app
npm install
npm run start                # live app
EXPO_PUBLIC_ADAPTERS=fixtures npm run start   # /dev mode
npm run android              # build for Android
npm run ios                  # build for iOS

# quality gates
npm run lint
npx tsc --noEmit

# terminology grep
grep -rnE '\b(Pending|Broadcasting|Confirmed|Incognito)\b' app/ components/ src/hooks/ src/fixtures/ | grep -v node_modules
```

## Escalation path

If any of these happen during execution, pause and escalate:

- Two decisions in `decisions.md` contradict each other in a specific context.
- A port from v3/workbench fails (API mismatch, missing module, compile error you can't resolve in one attempt).
- You detect that a completed earlier step is broken.
- A step's success criterion cannot be met with the current design.
- Scope creep becomes unclear — a step needs more than expected and the right split is ambiguous.

Escalation output: append a block to `progress.md` under "Open issues" with:
- What step / file triggered it.
- What specifically is blocking.
- What options you see.
- Request review from @intern or Opus.

Do not work around escalations silently. That's the failure mode this folder is designed to prevent.

## Session end checklist

Before closing a session:

- [ ] All commits pushed to `v3-full`.
- [ ] `npm run lint` and `npx tsc --noEmit` pass on HEAD.
- [ ] `progress.md` block filled (Shipped / Deviations / Open issues / Handoff).
- [ ] If `decisions.md` changed, the commit referenced the decision ID(s).
- [ ] If new scope surfaces emerged, they're listed in `progress.md` open issues and/or `screen-inventory.md`.
- [ ] If a doc became misleading, it's updated (not left as a parallel note).

## Related

- [README.md](./README.md) — orientation
- [decisions.md](./decisions.md) — contract
- [architecture.md](./architecture.md) — layer rules
- [screen-inventory.md](./screen-inventory.md) — surfaces
- [implementation-plan.md](./implementation-plan.md) — steps
- [quality-gates.md](./quality-gates.md) — process
- [progress.md](./progress.md) — log
- [lxmf-brief.md](./lxmf-brief.md) — parallel agent
