# lxmf-brief.md — Parallel LXMF agent brief

**Self-sufficient brief for an agent working on the LXMF NPM package track in parallel with v3-full UI work.**

Read this file plus the linked repo docs and you have everything needed. You do not need to read the rest of `docs/v3-full/` unless you hit an integration question.

## Your mission

Take `lxmf_react_native_rust` from its current "implementation complete, not yet published" state to a **published NPM package** (`@lxmf/react-native`) that the `v3-full` branch can drop in to replace its stub `useLxmf` hook.

## Where the package lives

- Repo root: `/home/epic/Downloads/anonmesh/lxmf_react_native_rust`
- Package root: `/home/epic/Downloads/anonmesh/lxmf_react_native_rust/expo-module/`
- GitHub: `https://github.com/anon0mesh/lxmf_react_native_rust`
- Package name: `@lxmf/react-native`
- Current version: `0.1.0`

## What's already done

Per the repo's `IMPLEMENTATION_COMPLETE.md` and `README.md`:

1. **Rust core** — compiles to `liblxmf_rn.a` (11 MB iOS) and `liblxmf_rn.so` (2.3 MB Android). Vendored via podspec + gradle copy.
2. **iOS module** — Swift FFI bindings, BLE manager scaffolded, 8 event types via `@_silgen_name`.
3. **Android module** — Kotlin module + JNI bridge, System.loadLibrary wired.
4. **TypeScript API** — `useLxmf` React hook, full state management, 7 event listeners.
5. **Expo plugin** — auto-configures BLE permissions via `app.plugin.js`.
6. **Example app** — runnable Expo app with 3 screens at `example-app/`.

## What's left

Unclear until you inspect, but likely:

1. **Build Rust libs for both platforms** — run `npm run rust:android && npm run rust:ios` (may require cross-compilation tooling; see `scripts/` in the repo for build scripts).
2. **Verify example-app works** — `cd example-app && npm install && npm start` with a custom dev client (not Expo Go). Confirm BLE mode exchanges messages between two devices.
3. **Resolve any build / linkage issues** — podspec or gradle may need tweaks for current Expo SDK (54 as of v3-full branch).
4. **Test under both modes** — at minimum `BleOnly` and `TcpClient`. `Reticulum` requires a local `rnsd` — document gracefully if not tested.
5. **Bump version** — from `0.1.0` to `0.1.1` or `1.0.0-beta.0` depending on stability.
6. **Publish to npm** — `npm publish --access public` from the `expo-module/` directory. Requires npm auth.
7. **PR the integration** into the `v3-full` branch (in `anon0mesh` repo): replace `src/infrastructure/lxmf/LxmfStubAdapter.ts` with a real adapter that calls the published package's `useLxmf`. See "Integration contract" below.

## Public API (the contract you must ship)

From the package README:

```ts
import { useLxmf, LxmfNodeMode } from '@lxmf/react-native';

const { start, stop, send, status, beacons, events } = useLxmf({
  identityHex: 'new',
  lxmfAddressHex: 'new',
  mode: LxmfNodeMode.BleOnly,
});
```

**Modes:**

| Mode | Value | Description |
|------|-------|-------------|
| `BleOnly` | 0 | BLE mesh only |
| `TcpClient` | 1 | TCP client to remote node |
| `TcpServer` | 2 | TCP server |
| `Reticulum` | 3 | Full Reticulum stack via local `rnsd` |

**Return shape (infer from hook, confirm):**

- `start(): Promise<void>`
- `stop(): Promise<void>`
- `send(recipientHex: string, contentBytes: Uint8Array | string): Promise<MessageId>`
- `status: { running, mode, localAddress, peerCount, ... }`
- `beacons: Beacon[]` — discovered beacon nodes
- `events: Event[]` — buffered recent events

`v3-full` has committed to mirroring this exact API in its stub. When you ship, the stub gets replaced by the real package and nothing else in the v3-full app changes. If the real API ends up different from the stub, bring the discrepancy to @intern immediately so `decisions.md` D25 can be updated.

## Integration contract with v3-full

When you're ready to integrate:

1. In `anon0mesh` repo, on `v3-full` branch, add `@lxmf/react-native` as a dependency.
2. Run the expo prebuild / dev-client flow — LXMF requires a custom dev client (not Expo Go). Document this in `anon0mesh/docs/v3-full/progress.md`.
3. Replace `src/infrastructure/lxmf/LxmfStubAdapter.ts` with a real adapter that wraps `useLxmf`.
4. Update `src/infrastructure/lxmf/index.ts` to export the real adapter.
5. Confirm `/dev` catalog still works with the fixture adapter (fixtures path should not touch the real package).
6. Open a PR into `v3-full`.

## Key files you'll touch

In `lxmf_react_native_rust`:

- `expo-module/package.json` — version bump, final peer deps verification.
- `expo-module/ios/LxmfModule.swift` + podspec.
- `expo-module/android/*.kt` + `build.gradle.kts`.
- `rust-core/` — may need a rebuild.
- `scripts/build-rust-*.sh` — cross-compile scripts.
- `README.md` + `QUICKSTART.md` — update if anything changes.

In `anon0mesh` (for integration PR):

- `package.json` (add dep).
- `src/infrastructure/lxmf/` (swap stub → real).
- `app.json` (`plugins: ["@lxmf/react-native"]`).
- `docs/v3-full/progress.md` (append entry).
- `docs/v3-full/decisions.md` (note D25 as resolved).

## Success criteria

1. `@lxmf/react-native` published on npm.
2. Fresh `npx create-expo-app` + `npm install @lxmf/react-native` + example code from README works (with custom dev client) on both Android and iOS.
3. `v3-full` branch imports the package; stub adapter is gone; `useLxmf` hook works from real package.
4. Two devices running the example app can exchange an LXMF message over BLE.
5. Integration PR to v3-full is opened and passes lint/typecheck.

## Stretch goals (time permitting)

- `Reticulum` mode end-to-end test against a local `rnsd`.
- TCP mode tested against a remote node.
- Beacon discovery tested.
- Unit tests for the hook's state transitions.
- Publish a minor version that supports `expo-modules-core` 4.x if applicable.

## Working rules

- **Don't rush. Stability > speed** — this package will be a dep of production code.
- **Commit in scoped chunks** — same rules as `anon0mesh/docs/v3-full/quality-gates.md` (conventional commits, small, scoped).
- **Document surprises in the LXMF repo's own docs** — not in v3-full docs. Cross-link where needed.
- **Don't publish to npm without @intern explicit approval** — first publish is a one-way door.
- **Coordinate naming** — if the real package's return shape or method names differ from what the README implies, flag to @intern before changing v3-full's stub.

## If you get stuck

- Rust build errors: check `rust-core/README.md` + the `FFI_WIRING.md` file at the LXMF repo root.
- iOS linkage errors: verify podspec vendors the static lib correctly, and that the Swift `@_silgen_name` symbols match Rust export names.
- Android JNI errors: confirm `build.gradle.kts` copies `liblxmf_rn.so` into the right ABI folder.
- Expo integration errors: check `expo-module.config.json` + `app.plugin.js`; Expo Modules Core docs at `https://docs.expo.dev/modules/`.

When truly stuck, escalate to @intern with specifics. Do not silently abandon a thread.

## Model recommendation

- **Sonnet 4.6** for execution — this brief is self-contained, doesn't need deep architectural judgment.
- **Opus 4.7** spot-check if Rust/Swift/Kotlin build-system complexity escalates.

## References

- Package: `/home/epic/Downloads/anonmesh/lxmf_react_native_rust/`
- Package README: `/home/epic/Downloads/anonmesh/lxmf_react_native_rust/README.md`
- IMPLEMENTATION_COMPLETE.md: `/home/epic/Downloads/anonmesh/lxmf_react_native_rust/IMPLEMENTATION_COMPLETE.md`
- FFI wiring: `/home/epic/Downloads/anonmesh/lxmf_react_native_rust/FFI_WIRING.md`
- Quickstart: `/home/epic/Downloads/anonmesh/lxmf_react_native_rust/QUICKSTART.md`
- Integration guide: `/home/epic/Downloads/anonmesh/lxmf_react_native_rust/INTEGRATION.md`
- Original LXMF reference: `https://github.com/markqvist/LXMF`
- Reticulum: `https://reticulum.network`

---

## Status

**Current:** Not started (2026-04-18, awaiting handoff).

**Owner:** TBD (parallel agent).

When you pick this up, append a session block below (mirror `progress.md` format from v3-full). First block:

```markdown
## YYYY-MM-DD — session 1
- Model: <>
- Agent/human: <>
- Goal: audit current package state + run build scripts
- Shipped: <>
- Deviations: <>
- Open issues: <>
- Handoff: <>
```
