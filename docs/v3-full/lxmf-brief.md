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

**Current:** Research + scoping session 2026-04-18 (Opus 4.7). Package scaffolded, rust libs built locally, never published. Stub in v3-full still empty (`export {}`).

**Owner:** TBD (parallel agent).

---

# Research dump — 2026-04-18 (recon, no code changes)

This section is the authoritative context for turning `lxmf_react_native_rust` into a production `@lxmf/react-native` npm package consumed by anon0mesh v3-full. Everything below is grounded in repo inspection. `##` above this line is original brief; ### sub-headings below are research output.

## What the package actually is (verified)

- Expo Module (new arch compatible) wrapping Rust core → C FFI (iOS) + JNI (Android).
- Rust crate `rust-core` depends on `FreeTAKTeam/LXMF-rs :: rns-embedded-ffi` (git dep, no pinned rev seen in brief — must verify `Cargo.toml`).
- Crate types: `staticlib` (iOS .a via XCFramework) + `cdylib` (Android .so).
- TS entry: `expo-module/src/{LxmfModule.ts, useLxmf.ts, index.ts}` — compiled to `build/` by prepublish hook.
- Native sources: `ios/LxmfModule.swift` + `ios/BLEManager.swift` (BLE 20% done), `android/.../LxmfModule.kt` (JNI stubs).
- Expo config plugin `app.plugin.js` auto-adds BLE perms.
- iOS build: `scripts/build-rust-ios.sh` → builds device + sim-arm64 + sim-x86_64, `lipo`s sims, emits `expo-module/ios/RustCore/liblxmf_rn.xcframework`.
- Android build: `scripts/build-rust-android.sh` → NDK cross-compile arm64/armv7/x86_64 → `expo-module/android/src/main/jniLibs/<abi>/liblxmf_rn.so`.
- `package.json` scripts `rust:android`, `rust:ios`, `build:all` already wired.

## API surface (verified — v3-full stub must mirror exactly, D25)

Mode enum — **4 values, not 2**. Update `lxmf-brief.md` table above at some point:

```ts
enum LxmfNodeMode { BleOnly = 0, TcpClient = 1, TcpServer = 2, Reticulum = 3 }
```

`useLxmf(options)` full signature (from `expo-module/src/useLxmf.ts`):

```ts
UseLxmfOptions = {
  autoStart?: boolean;
  identityHex?: string;            // 64-char hex = 32 bytes
  lxmfAddressHex?: string;         // 32-char hex = 16 bytes
  dbPath?: string;                 // SQLite path
  logLevel?: number;               // 0=err, 3=debug
  mode?: LxmfNodeMode;             // default BleOnly
  tcpInterfaces?: { host; port }[]; // required for TcpClient/Server/Reticulum
  announceIntervalMs?: number;     // default 5000
  bleMtuHint?: number;             // default 255
  displayName?: string;            // default ""
}
```

Returns: `{ status, beacons, events, error, isRunning, isNativeAvailable, start, stop, send, broadcast, getStatus, getBeacons, fetchMessages, setLogLevel, startBLE, stopBLE, bleUnpairedRNodeCount }`.

Note: `start()` **takes an overrides object**, not positional args (brief was wrong — `start(identityHex, addressHex, mode)` docs are outdated). Real signature: `start(overrides?: { identityHex, lxmfAddressHex, mode, tcpInterfaces, displayName })`.

`send()` signature is `send(destHex: string, bodyBase64: string) → Promise<number>` (op id), **not** `send(destHex, Uint8Array | string)` as brief implied. Body must be base64-encoded string at API boundary.

Events typed: `'statusChanged' | 'packetReceived' | 'txReceived' | 'beaconDiscovered' | 'messageReceived' | 'announceReceived' | 'log' | 'error'`.

Exposed types: `LxmfNodeStatus`, `Beacon`, `LxmfEvent`, `TcpInterface`, `UseLxmfOptions`, `LxmfNodeMode` enum.

## Gaps blocking "production npm package"

1. **Publishing**: never published. `version = 0.1.0`. No CHANGELOG. `publishConfig.access = public` set, but `@lxmf` npm scope ownership unverified (may need to create org or switch scope). First publish = one-way door per brief.
2. **Peer deps too loose**: `expo`, `expo-modules-core`, `react`, `react-native` all pinned to `"*"`. Consumer resolvers can't de-dupe. Should pin ranges matching Expo SDK 54 (RN 0.76, React 19, expo-modules-core ~4.x).
3. **Example-app not tested under Expo SDK 54** — brief says `example-app` exists but IMPLEMENTATION_COMPLETE predates SDK 54. Its `package.json` needs audit.
4. **No CI** — cross-compile of Rust, typecheck, lint, `npm pack` all manual. A one-dev package is fragile. GitHub Actions for macos (iOS xcframework) + ubuntu (android .so + tsc) recommended.
5. **Prebuilts in tarball vs build-on-install**: current `files` array publishes only `ios/` + `android/build.gradle.kts` + `android/src/main` + podspec + build plugin + `README.md`. **Does NOT include prebuilt .a/.so** unless they live inside those dirs. Need to verify: are `ios/RustCore/*.xcframework` and `android/src/main/jniLibs/<abi>/*.so` committed + included? If not, every consumer (incl anon0mesh) needs NDK + macOS + Xcode to install. That's a huge friction wall.
6. **BLE manager incomplete** (iOS 20%, Android 0%). `BleOnly` mode may not actually work device-to-device. **Must verify** with two devices before claiming v1. If it doesn't work, ship `Reticulum` (TCP to rnsd) mode first and market BLE as beta.
7. **No unit / integration tests**. `npm test` runs `jest` but no spec files present. Rust has `cargo test` but coverage unknown.
8. **Loose `LxmfEvent` type**: `[key: string]: any`. Should be a discriminated union for safety.
9. **No cbindgen** for C header auto-gen — manually maintained header risks drift (see `reticulum_rn/PORTING_BEST_PRACTICES.md` for the same project's sibling recommendation).
10. **`expo-modules-core` in devDependencies AND peerDependencies** — duplicate. Keep only as peer + dev (not dep).
11. **`@types/react-native` listed** — RN ≥0.72 ships own types, `@types/react-native` is deprecated/stub. Remove.
12. **`@types/react ^19.2.14`** — confirm alignment with anon0mesh (likely React 19 already).
13. **No `LICENSE` file at package root** — podspec + package.json say MIT but a standalone `LICENSE` is expected by npm.
14. **`homepage` points to anonme.sh** — fine, but consider a package-specific landing or docs URL.

## Target state — "solid perfect package"

Checklist for v1.0.0:

- [ ] Binary distribution policy decided (prebuilts-in-tarball preferred for DX; see Q1).
- [ ] Peer deps pinned (expo ≥54, rn ≥0.76, react ≥19, expo-modules-core ≥4).
- [ ] CI: macos runner builds xcframework, ubuntu runner builds all android ABIs, both published to release artifacts, tarball assembled on linux runner. Verify with `npm pack --dry-run` (already a script).
- [ ] Example-app green on Expo SDK 54 dev client (iOS + Android) in both BleOnly and Reticulum modes (w/ local rnsd).
- [ ] TS strict, zero `any` (tighten `LxmfEvent`).
- [ ] Unit tests: hook state machine (jest + @testing-library/react-hooks), FFI stub shimmed.
- [ ] cbindgen to auto-derive C header from `ffi.rs`.
- [ ] CHANGELOG.md (keepachangelog style).
- [ ] LICENSE file copied to package root.
- [ ] `@lxmf` npm scope created + intern owns, or pivot to `@anonmesh/lxmf-react-native`.
- [ ] README rewritten w/ SDK 54 dev client instructions, all 4 modes, troubleshooting (BLE perm, NDK miss, missing xcframework), and API table.
- [ ] Version bumped to `1.0.0-beta.0` for first publish, reserve `1.0.0` for "BLE works two-device tested".
- [ ] GitHub release tags match npm versions (CI automates).
- [ ] `prepublishOnly` runs typecheck + lint + test + `npm pack --dry-run` verification.

## Integration into v3-full (once published)

Current v3-full stub (`src/infrastructure/lxmf/index.ts`) = `export {};`. It's empty — D25's "mirror the API from day 1" hasn't happened yet. Two paths:

1. **Swap-in path (clean)**: v3-full team writes a stub `useLxmf` hook in `src/infrastructure/lxmf/LxmfStubAdapter.ts` that returns empty data matching the real shape above. When pkg publishes, replace stub's internal impl with `import { useLxmf } from '@lxmf/react-native'` and re-export. Consumers (`src/hooks`, components) never notice the swap.
2. **Early dep path (risky)**: depend on package via git URL or `file:../lxmf_react_native_rust/expo-module` during dev. Lets v3-full test real transport before npm publish. Requires pnpm workspace config or local path hack.

Recommend path 1 for v3-full (brief already says this). Path 2 only for end-to-end smoke test before opening the integration PR.

## Publishing options (D-TBD)

| Option | Pros | Cons |
|---|---|---|
| `@lxmf/react-native` on public npm | Clean, brand owns canonical name | Need to create/claim `@lxmf` scope; first pub = one-way |
| `@anonmesh/lxmf-react-native` on public npm | Already owned scope presumably, clear org signal | Ties to anonmesh brand; LXMF is generic |
| Private npm (npm org paid / GH Packages) | No brand-squat risk pre-launch | anon0mesh consumers need auth token in CI |
| Unpublished; consume via git+https in anon0mesh | Zero infra, fastest | Anon0mesh build needs NDK+Xcode unless prebuilts committed; dep resolution slower |

Brief assumes public `@lxmf/react-native`. **Confirm scope availability before v1 publish** (`npm view @lxmf/react-native` — expect 404).

## Repo strategy

Current: `lxmf_react_native_rust` sits as a sibling dir to `anon0mesh`, not a submodule. Options:

- **Keep standalone, publish via npm**: canonical. Anon0mesh depends on the published tarball. ← recommended.
- **Git submodule of anon0mesh**: couples them tightly; complicates CI. Don't.
- **pnpm workspace**: viable if we decide anonmesh monorepo — but that's a bigger rearchitecture, out of scope.

Recommend: keep standalone, consume via npm for prod, `file:` for local dev when needed, gated by a root `.npmrc` or `overrides`.

## Risks / sharp edges

- **BLE works?** Unverified. Two-device BLE test is the single biggest risk. Ship a BLE-beta marker in README if not validated before v1.
- **Expo SDK 54 + RN new arch**: `requireOptionalNativeModule` + Expo NativeModule event emitter (`mod.addListener`) already use new-arch pattern — good. But `BLEManager.swift` + JNI bridge may need re-audit under Fabric/TurboModules. Verify with `expo doctor` on example-app.
- **Binary bloat**: 11MB iOS .a + 2.3MB android .so per ABI. Android gets 3 ABIs × 2.3MB = 6.9MB minimum in APK. Consider dropping x86_64 for release, keeping only for dev.
- **LXMF-rs upstream churn**: `rns-embedded-ffi` is git dep. Pin to a specific rev in `Cargo.toml` before v1.
- **Static library SKU**: podspec approach w/ `liblxmf_rn.xcframework` is standard; if consumer uses RN CLI (not Expo prebuild), autolinking of the expo-module may fail. Document the `npx expo prebuild` requirement in README (already implied).
- **License compatibility**: LXMF-rs upstream license (MIT/Apache?) — verify no copyleft before declaring our package MIT. Probably fine but verify once.

## Where to start — recommended execution order

Pre-implementation (this session's research output):

1. Answer the open questions below (intern decisions).
2. Create an ADR in mempool: `anonmesh_mempool/docs/04-decisions/0005-lxmf-package-v1.md` capturing package name, scope, versioning, binary-distribution policy. (Not yet written — gated on Qs.)

Implementation phase (separate session, Sonnet 4.6 per D26):

1. **Audit** — `cd lxmf_react_native_rust && git status`, dump current lib sizes, list of files in `expo-module/ios/RustCore/` and `expo-module/android/src/main/jniLibs/`.
2. **Rebuild Rust** — run both build scripts fresh, confirm outputs land in the right places.
3. **Example-app smoke test** — bump to Expo SDK 54, `npx expo prebuild --clean`, run on Android emulator in BleOnly mode. If BLE can't mesh, fall back to Reticulum mode w/ local rnsd.
4. **Clean up `package.json`** — pin peer deps, remove bad dev deps, verify `files` array, add `LICENSE`.
5. **Tighten TS** — discriminated union for `LxmfEvent`.
6. **Write stub in v3-full first** (`LxmfStubAdapter.ts`) mirroring the real shape, unblock v3-full execution.
7. **Package validation** — `npm pack`, inspect tarball contents, verify prebuilts included.
8. **Publish beta** — `1.0.0-beta.0` to npm.
9. **Swap stub → real** in v3-full, open PR.
10. **Publish 1.0.0** once two-device BLE or Reticulum mode is confirmed.

## Open questions (need intern decisions before implementation)

1. **Scope + package name**: `@lxmf/react-native` (need to claim scope), or `@anonmesh/lxmf-react-native` (already-owned scope, worse brand)? Default: pursue `@lxmf/react-native`; fallback to `@anonmesh/*`.
2. **Binary distribution**: commit + ship prebuilt `.xcframework` and `.so`s inside the tarball (easy consumer install, fat package ~30-40MB)? Or require consumer to run build scripts post-install (small tarball, requires NDK+Xcode toolchain on every developer machine)? Default recommendation: ship prebuilts.
3. **Versioning strategy**: start at `1.0.0-beta.0` (signals prod intent), or stay `0.1.x` until BLE is verified? Default: beta.0.
4. **BLE completion priority**: block v1 on finishing BLE manager + two-device test, or ship `Reticulum`-mode-first v1 (TCP to rnsd) and mark BLE as "preview"? Default: Reticulum-first, BLE preview. Faster to ship.
5. **Platform priority**: Android-first (Seeker is Android) or both at v1? Default: both; iOS simulator-only testing for v1, physical iOS in v1.1.
6. **CI platform**: GitHub Actions (public repo, free macos minutes limited) or self-host? Default: GitHub Actions. Accept macos minutes cost.
7. **Repo location**: keep at `github.com/anon0mesh/lxmf_react_native_rust` (current per README) as standalone, or fold into a monorepo later? Default: standalone, as today.
8. **Upstream pin**: pin `rns-embedded-ffi` to a specific git rev or keep floating `main`? Default: pin to whatever rev passes two-device test.
9. **License sanity-check**: confirm LXMF-rs upstream is MIT/Apache-compatible with our MIT. (Intern to verify / I can verify in next session.)
10. **Stub-first vs dep-first in v3-full**: write stub now (unblocks v3-full UI work), publish real pkg later, swap? Or wait for pkg publish before v3-full touches LXMF? Default: stub-first. (Brief D25 implies this.)

---

## Session log

### 2026-04-18 — recon session (no code changes)
- Model: Opus 4.7
- Agent/human: intern + Opus
- Goal: audit current state, produce the research dump + open questions above
- Shipped: this doc update only
- Deviations: none from brief
- Open issues: 10 questions listed above
- Handoff: intern answers → ADR in mempool → new Sonnet session executes the "recommended execution order" block
