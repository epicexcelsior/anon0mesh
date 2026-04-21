# handoff.md — v3-full recovery kickoff

Use this when starting a fresh chat / session for the next recovery phase.

## Status

As of 2026-04-21:

- recovery Phase 0 reset is done
- first Phase 1 functional repairs are done
- Phase 2 token / primitive reconciliation is done
- Home, Send, Messages, Peers, and Settings are rebuilt as truthful Phase 3 screens
- current build-around limits are documented in `README.md`, `screen-inventory.md`, and `progress.md`
- next major move is **start Phase 4 backend truth pass**

Do **not** treat older "final gates complete" or workbench-first wording as active contract.

## Kickoff prompt (paste this into a fresh chat)

```text
You are picking up the next recovery phase of `v3-full` in the `anon0mesh` repo.

Repo: /home/epic/Downloads/anonmesh/anon0mesh
Branch: v3-full
Planning folder: docs/v3-full/

Read these files before making any code changes, in this exact order:

1. docs/v3-full/recovery-plan.md
2. docs/v3-full/progress.md
3. docs/v3-full/decisions.md
4. docs/v3-full/README.md
5. docs/v3-full/screen-inventory.md
6. docs/v3-full/handoff.md

Secondary reads only if needed:
- docs/v3-full/architecture.md
- docs/v3-full/quality-gates.md
- docs/v3-full/implementation-plan.md

Source precedence is:
1. worktrees/anon0mesh-fork-ui (feature/ui-redesign, Void Protocol lane) for visual canon
2. docs/v3-full/{recovery-plan,decisions,screen-inventory}.md for product contract
3. current v3-full app code for architecture and working seams
4. historical workbench references only when they still align

Current truth to preserve:
- BLE peer discovery is live
- wallet/send/history seams are live, with Home/history/detail now merging in-session submit state with parsed on-chain SOL transfer history
- onboarding wallet entry is live through the active adapter lane, but unsupported wallet paths are still disabled per device/session instead of both being simultaneously available
- redesigned send flow is live, but delivery is still on-chain only
- redesigned messaging UI is live, but message history / delivery are still fixture-backed
- redesigned peer surfaces are live around the BLE discovery seam, but deeper relay / beacon metrics are still staged
- redesigned settings surfaces are live, with local device-label persistence, Home hero propagation, and truthful wallet-export gating
- LXMF runtime is still stubbed
- stealth transfer path is still staged, not complete
- beacon staking is still placeholder

Current baseline to preserve:
- npm run lint => 0 errors / 11 inherited warnings
- npx tsc --noEmit => 5 inherited baseline errors:
  - components/screens/SolanaTransactionScreen.tsx(151,22)
  - components/ui/Header.tsx(61,45)
  - src/gossip/GCSFilter.ts
  - src/gossip/PacketIdUtil.ts
  - src/solana/SolanaTransactionManager.ts

Your job for the next phase:
1. keep docs truthful
2. commit in small scoped chunks
3. start Phase 4 backend truth pass
4. tighten the runtime-truth seams across wallet history / send status / messaging / peers / settings without opening a second design lane
5. do not overclaim unfinished LXMF / stealth / beacon functionality in UI copy
6. keep onboarding Setup truthful about which wallet path is live on the current device, and do not claim eager permission prompts that still happen contextually later

Execution rules:
- Append a new session block to docs/v3-full/progress.md
- If you change behavior or meaning, update the relevant canonical doc in the same commit
- Run npm run lint and npx tsc --noEmit before each commit, and compare against the known baseline above
- If a supporting doc conflicts with recovery-plan.md or progress.md, treat the recovery docs as authoritative and either fix the stale doc or record it in progress.md
- Do not start from implementation-plan.md; it is historical reference only where it does not conflict with recovery docs

First action after reading: summarize the current phase, list the active constraints, and propose the smallest safe backend-truth-first commit.
```

## What To Read vs Ignore

Always trust first:

- `recovery-plan.md`
- `progress.md`
- `decisions.md`
- `README.md`
- `screen-inventory.md`

Use carefully:

- `architecture.md`
- `quality-gates.md`
- `implementation-plan.md`

Those supporting docs still contain some older workbench-first / pre-recovery wording in places.

## Next Phase Scope

The next phase is **not** "finish everything."

The next phase is:

1. Phase 4 backend truth pass

## Commands

```bash
# run the app
npm install
npm run start
EXPO_PUBLIC_ADAPTERS=fixtures npm run start
npm run android
npm run ios

# quality baseline
npm run lint
npx tsc --noEmit

# terminology grep
grep -rnE '\b(Pending|Broadcasting|Confirmed|Incognito)\b' app/ components/ src/hooks/ src/fixtures/ | grep -v node_modules
```

## Session End Checklist

- [ ] `progress.md` updated with Shipped / Deviations / Open issues / Handoff
- [ ] any changed behavior reflected in canonical docs
- [ ] `npm run lint` still at 0 errors / 11 inherited warnings
- [ ] `npx tsc --noEmit` still only shows the 5 inherited baseline errors, or any change is documented
- [ ] commits are small and scoped

## Related

- [recovery-plan.md](./recovery-plan.md)
- [progress.md](./progress.md)
- [decisions.md](./decisions.md)
- [README.md](./README.md)
- [screen-inventory.md](./screen-inventory.md)
- [quality-gates.md](./quality-gates.md)
