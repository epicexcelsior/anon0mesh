# quality-gates.md — v3-full quality and process discipline

Rules that execution agents follow. Designed to keep the branch high-quality and free of silent drift.

Read `decisions.md` first.

## Commit discipline

### Principles

- **Small, scoped commits.** One logical change per commit. Do not bundle unrelated work.
- **Message format:** follow v3 branch's conventional style: `type(scope): short imperative`. Examples: `feat(home): add mesh status strip`, `refactor(domain): split Transaction entity`, `docs(v3-full): record D9 glass token merge`.
- **Reference decision IDs.** When a commit implements or changes a decision from `decisions.md`, mention the ID in the commit body: `Implements D6.` or `Supersedes D11 — see updated decisions.md.`
- **Never commit without running:** `npm run lint` and `npx tsc --noEmit`. Both must pass. If warnings exist, judge whether to fix or leave; document anything non-obvious in the commit body.

### Commit frequency

- After every complete unit of work (one component extracted, one route wired, one token file landed).
- Do not batch a full day into one commit. Future you, team lead, and PR review can't reason about it.

### Never do

- `git push --force` on `v3-full` or any shared branch.
- `--no-verify` to bypass hooks.
- `git reset --hard` on shared refs.
- Amend a commit that has been pushed.

## Doc-update discipline

The v3-full docs are the living contract. If code and docs drift, we are lost.

### Rules

1. **Deviation rule.** If you break or change a decision in `decisions.md` during execution, update `decisions.md` in the same commit as the code change. Mark the prior text as superseded; add the new decision with its own ID. Do not silently deviate.

2. **Progress rule.** Every execution session updates `progress.md`:
   - Start: one-line entry with date, model, session goal.
   - End: a short block capturing what shipped, what drifted, what's still open, and any handoff note for next session. Bullet points are fine. Max ~15 lines per session.

3. **Adjacent-doc rule.** When a note fits in an existing doc, add it there. Do not create new docs for things that could be a new section or row in an existing doc. Specifically:
   - New decisions → `decisions.md`.
   - Execution notes / deviations / open issues → `progress.md`.
   - New surfaces or changes to surface scope → `screen-inventory.md`.
   - Architectural rule changes → `architecture.md`.
   - New quality rules → this file.
   - Only create a new doc if the content does not fit any existing one.

4. **Conciseness rule.** Docs should be tight and relevant. If a progress entry is more than a paragraph of narrative, it is probably hiding a decision — extract the decision to `decisions.md` and leave a one-liner in progress.

5. **No future tense in committed docs.** Decisions and architecture docs describe what is, not what will be. Future work belongs in `progress.md` open-issues or an ADR in the mempool.

## Testing approach (TDD-adapted)

Straight TDD cycles (write failing test → watch it fail → implement → pass → commit) fit some layers of this project and not others. Apply each layer's appropriate discipline.

### Where TDD applies (write tests first)

- `src/domain/` — pure logic, types, services. Write interface tests against expected behavior before any implementation.
- `src/hooks/` — hook state transitions. Test with `@testing-library/react-hooks` or equivalent: initial state → action → expected state.
- `src/infrastructure/` adapters — test the interface contract against a fake backend (or mocked platform calls) before real integration.
- Utility functions in `src/design-system/` or elsewhere that take pure inputs → pure outputs.

Format per skill: failing test → run → implement → run → commit. One logical assertion per test. No snapshot tests for domain logic.

### Where TDD does not fit (visual verification)

- `components/` primitives and domain components — React Native UI rarely benefits from pre-written tests. Snapshot tests rot fast; pixel-diffing requires device farms. Instead:
  1. Build the component.
  2. Render under `/dev` catalog preview with the relevant fixture preset.
  3. Visually verify on device (Android + iOS when possible) — render, layout, motion, haptic, sound.
  4. If a prop has discrete variants (e.g. `Pill tone`), enumerate them in the catalog view.
- `app/` routes — same rule: visual review against `/dev` fixture presets.
- Motion timings — verify on device; timing tests in isolation don't catch perceptual issues.

### Required tests for v3-full (minimum bar)

- All `src/domain/status/TransferStatus.ts` transitions — unit tests.
- All `src/domain/services/` interfaces — one contract test each.
- All `src/hooks/` — at least a "returns initial state" test + one action path test.
- All fixture adapters — a smoke test that domain operations return expected fixture shapes.
- Terminology lock — a CI-runnable grep (see below).

### Required visual checks (minimum bar)

- Every surface in `screen-inventory.md` renders without error under the matching fixture preset.
- Motion feels right (no bounce, overdamped).
- Haptics + sound fire on primary interactions.
- Screens render correctly in both portrait and landscape (or portrait-only if locked).

### Test commands

```bash
npm test                   # unit tests, once Jest or Vitest is configured
npm run lint
npx tsc --noEmit
grep -rnE '\b(Pending|Broadcasting|Confirmed|Incognito)\b' app/ components/ src/hooks/ src/fixtures/ | grep -v node_modules
```

Add `npm test` to the pre-commit habit once the domain + hook test suite exists.

## Code quality gates

### Pre-commit (automated where possible)

```bash
npm run lint          # eslint
npx tsc --noEmit      # typecheck
```

Both must exit 0. If they don't, fix before commit.

### Per-screen acceptance

Before marking a screen "done" in `progress.md`:

- [ ] All tokens used come from `src/design-system/tokens/`. No inline hex, no inline spacing numbers.
- [ ] No direct imports from `src/infrastructure/` into `components/`.
- [ ] Terminology lock holds (see grep gate below).
- [ ] Motion + haptics + sound hooked for primary interactions (press, confirm, error).
- [ ] Empty / loading / error states exist (not just the happy path).
- [ ] Works under `/dev` with the relevant fixture preset.

### Per-commit sanity

- Import direction respected (components → hooks → domain ← infrastructure). If eslint import-path rule catches you, fix the import, not the rule.
- No files over ~400 lines without reason — split by responsibility.

## Terminology lock (grep gate)

These banned strings must not appear in user-facing copy (commits, tests, fixtures, and strings passed into UI components):

| Banned | Required |
|---|---|
| `Pending` (for transfers) | `Queued on device` |
| `In queue` | `Queued on device` |
| `Held` | `Queued on device` |
| `Broadcasting` | `Handed to mesh` |
| `Relaying` | `Handed to mesh` |
| `In transit` | `Handed to mesh` |
| `Confirmed` | `Settled` |
| `Completed` (for transfers) | `Settled` |
| `Proof retained` | `Proof attached` |
| `Incognito` | `Stealth` |
| `Private mode` | `Stealth` |

Grep check (run before big PRs or at session end):

```bash
# replace <patterns> with the banned strings above, one at a time, in UI-facing paths
grep -rnE '\b(Pending|Broadcasting|Confirmed|Incognito)\b' app/ components/ src/hooks/ src/fixtures/ | grep -v node_modules
```

Treat any hit in user-facing copy as a bug. Hits in internal service names or external API types are fine (e.g. a raw Solana status "confirmed" is a third-party string, display it mapped).

## Polish discipline

### Pass 1: coverage

Get every surface in `screen-inventory.md` rendering with correct structure, content, and navigation. Motion + haptics + sound hooked in as primitives are built, not retrofitted. This is the "don't lose the polish" rule from decisions.md D13/D14.

### Pass 2: polish

Only after Pass 1 covers all surfaces:

- Alignment, spacing consistency, optical adjustments.
- Animations timing refinement.
- Edge states (offline, permission denied, empty, loading skeletons).
- Sound + haptic feel tuning.
- Accessibility pass.

### Non-goals during polish

- Redesign. If something feels wrong, check decisions.md and workbench canon. Only deviate if there is a concrete reason beyond "I'd do it differently." Deviations update decisions.md.
- New features. Anything new goes in `progress.md` open-issues and waits for the user's call.

## Visual review gates

Before each session-end commit:

- Run the app against the latest workbench preset (`EXPO_PUBLIC_LAUNCH_PRESET=pending-relay-queue npm run start:workbench` equivalent, ported to new branch).
- Navigate every surface touched this session.
- Confirm: nothing broken, nothing obviously regressed, motion/haptics feel right.

If the session added new surfaces, add a screenshot or short video link to `progress.md` entry (optional but helpful).

## Branch hygiene

- Do not merge to `main` without team lead review.
- Rebase on `upstream/main` weekly or before major merges.
- Keep `v3-full` as the integration branch. For risky work, cut a sub-branch (`v3-full-<topic>`), land it via PR to `v3-full`.

## Escalation

If an execution agent (Sonnet) hits any of these, stop and escalate to Opus (or human):

- A decision in `decisions.md` appears wrong or self-contradictory.
- Two locked decisions conflict in a specific screen context.
- A backend adapter is unexpectedly broken (e.g. MWA port fails on current Expo SDK).
- Typecheck or lint fails after reasonable attempts.
- Scope creep: the work is more than the plan expects, and the right call is unclear.

Escalation = pause execution, write the issue as a `progress.md` open-issue entry with specifics, and request review.

## Related

- [decisions.md](./decisions.md) — the contract
- [progress.md](./progress.md) — the log
- [handoff.md](./handoff.md) — session kickoff
