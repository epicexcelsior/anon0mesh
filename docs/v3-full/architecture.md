# architecture.md — v3-full architecture

Layer rules and folder structure for the v3-full branch. Read `decisions.md` first.

## Principles

1. **One-way import direction.** Higher layers import from lower layers, never the reverse.
2. **Pure domain.** `src/domain/` has no React Native imports, no platform calls, no side effects. It defines types and service interfaces.
3. **Infrastructure is swappable.** Each adapter in `src/infrastructure/<name>/` implements a domain interface. Swapping an adapter should not require changes in `components/`, `src/hooks/`, or `src/domain/`.
4. **Components consume hooks.** UI never imports infrastructure directly. UI never instantiates services. Hooks are the seam.
5. **Fixtures replace adapters for `/dev`.** Preview mode swaps real adapters for fixture-backed ones via the adapter boundary, not via component-level conditionals.

## Import direction

```
components/           (UI — reads hooks, renders, fires callbacks)
   ↓
src/hooks/            (UI ↔ domain bridge — calls services, exposes React state)
   ↓
src/domain/           (pure — types, entities, service interfaces, policies)
   ↑
src/infrastructure/   (side-effectful adapters — implement domain interfaces)
```

- `components/` imports `src/hooks/`, `src/design-system/`, and other `components/` only.
- `src/hooks/` imports `src/domain/` and React. Does not import from `src/infrastructure/` directly; receives adapters via a wallet/app-level context or provider composition.
- `src/domain/` imports nothing except types from itself.
- `src/infrastructure/<adapter>/` imports `src/domain/` (to satisfy an interface) and platform modules. Never imports from `components/` or `src/hooks/`.
- `src/design-system/` is leaf. It's imported by `components/` and nothing else depends on it.

Enforcement: a lint rule on `import/no-restricted-paths` with these boundaries. Set up in `eslint.config.js` as part of scaffolding.

## Folder structure

```
v3-full/
├── app/                            # expo-router routes
│   ├── _layout.tsx                 # root provider stack (theme, wallet, mesh, etc.)
│   ├── index.tsx                   # landing
│   ├── onboarding/
│   │   ├── welcome.tsx
│   │   ├── setup.tsx
│   │   └── tech-drawer.tsx         # optional deep-dive
│   ├── (tabs)/
│   │   ├── _layout.tsx             # tab bar (Home/Messages/Settings)
│   │   ├── home.tsx
│   │   ├── messages.tsx
│   │   └── settings.tsx
│   ├── messages/[peerId].tsx       # conversation detail (push)
│   ├── send/
│   │   ├── recipient.tsx
│   │   ├── amount.tsx
│   │   ├── review.tsx
│   │   └── success.tsx
│   ├── receive.tsx
│   ├── history/index.tsx           # tx history (may be a segment on home.tsx instead)
│   ├── history/[txId].tsx          # tx detail
│   ├── peers/index.tsx             # peers sheet (or modal group)
│   ├── peers/[peerId].tsx          # peer detail
│   ├── settings/
│   │   ├── network.tsx
│   │   ├── privacy.tsx
│   │   ├── beacon.tsx
│   │   ├── identity.tsx
│   │   ├── wallet-export.tsx
│   │   └── about.tsx
│   └── dev/index.tsx               # catalog preview (dev builds only)
│
├── components/
│   ├── primitives/                 # DepthButton, Sheet, SlideToConfirm, GlassSurface, Pill, SegmentedControl, TextInput, etc.
│   ├── home/                       # HomeHero, MeshStatusStrip, RecentActivity, BalanceCard
│   ├── messages/                   # ConversationRow, MessageBubble, ComposerBar, PeersDrawer, LockIcon
│   ├── send/                       # RecipientPicker, AmountKeypad, ReviewCard
│   ├── mesh/                       # MeshStatusStrip, PeersList, PeerCard, SignalBars, NodeGraph (polish-pass)
│   ├── settings/                   # SettingsSection, SettingsRow, IdentityCard, BeaconStakeCard
│   ├── onboarding/                 # LandingCanvas, FeatureHighlight, PermissionPrimer, WalletPathPicker, TechDrawerContent
│   └── shared/                     # Header, SectionLabel, Toast, ErrorBanner, LoadingShimmer
│
├── src/
│   ├── design-system/              # ported verbatim from workbench
│   │   ├── tokens/
│   │   │   ├── foundation.ts       # palette, spacing, radius, type scale, fonts
│   │   │   ├── semantic.ts         # semantic color tokens, shadow
│   │   │   ├── component.ts        # component-scoped tokens
│   │   │   ├── state.ts            # depth, feedback, press config
│   │   │   ├── motion.ts           # durations, easings, springs (overdamped, no bounce)
│   │   │   ├── registry.ts         # token registry for catalog mode
│   │   │   └── index.ts            # barrel
│   │   ├── glass.ts                # NEW — 4-variant factory from wireframe styles.css
│   │   ├── useGlass.ts             # glass variant hook
│   │   ├── useFonts.ts             # Space Grotesk + Manrope + JetBrains Mono loader
│   │   ├── useSound.ts             # play named event
│   │   └── useHaptic.ts            # haptic event trigger
│   │
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Peer.ts
│   │   │   ├── Message.ts
│   │   │   ├── Transaction.ts
│   │   │   ├── Wallet.ts
│   │   │   └── Identity.ts
│   │   ├── services/
│   │   │   ├── WalletService.ts        # interface
│   │   │   ├── TransactionService.ts   # interface
│   │   │   ├── MeshService.ts          # interface
│   │   │   ├── MessagingService.ts     # interface
│   │   │   └── BeaconService.ts        # interface
│   │   ├── status/
│   │   │   └── TransferStatus.ts       # 'Queued on device' | 'Handed to mesh' | 'Settled'
│   │   └── index.ts
│   │
│   ├── infrastructure/
│   │   ├── wallet/
│   │   │   ├── LocalWallet/LocalWalletAdapter.ts
│   │   │   ├── MWA/MWAWalletAdapter.ts
│   │   │   └── index.ts
│   │   ├── solana/
│   │   │   ├── SolanaTransactionService.ts
│   │   │   └── index.ts
│   │   ├── ble/
│   │   │   ├── MeshBLEContext.tsx        # React context for mesh runtime
│   │   │   ├── BLEMeshAdapter.ts         # implements MeshService
│   │   │   └── index.ts
│   │   ├── lxmf/
│   │   │   ├── LxmfStubAdapter.ts        # stub impl; real @lxmf/react-native swaps in
│   │   │   └── index.ts
│   │   ├── stealth/
│   │   │   ├── StealthQueueAdapter.ts    # placeholder; returns mock IDs
│   │   │   └── index.ts
│   │   ├── beacon/
│   │   │   ├── BeaconAdapter.ts          # stub for stake/co-sign
│   │   │   └── index.ts
│   │   ├── fixtures/                     # fixture-backed adapters for /dev and tests
│   │   │   ├── FixtureMeshAdapter.ts
│   │   │   ├── FixtureWalletAdapter.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── hooks/
│   │   ├── useWallet.ts
│   │   ├── useTransaction.ts
│   │   ├── useMesh.ts                    # node count, signal, iface, peers
│   │   ├── usePeers.ts
│   │   ├── useMessages.ts
│   │   ├── useBeacon.ts
│   │   ├── useLxmf.ts                    # stub → real package swap later
│   │   └── useOnboarding.ts
│   │
│   ├── providers/
│   │   ├── AdapterProvider.tsx           # injects real vs fixture adapters
│   │   ├── ThemeProvider.tsx             # re-exports workbench theme
│   │   ├── WalletProvider.tsx
│   │   └── MeshProvider.tsx
│   │
│   ├── fixtures/                         # preview data for /dev
│   │   ├── peers.ts
│   │   ├── conversations.ts
│   │   ├── transactions.ts
│   │   └── presets.ts
│   │
│   └── polyfills.ts
│
├── assets/
│   ├── brand/
│   │   ├── anonmesh-logo.png
│   │   ├── anonmesh-logo@2x.png
│   │   ├── anonmesh-logo@3x.png
│   │   └── anonmesh-wordmark.svg        # optional
│   ├── sounds/                          # workbench SFX
│   │   └── workbench/                   # 6 WAVs
│   ├── images/                          # images
│   └── icons/                           # custom mesh/beacon/identity SVGs
│
├── docs/
│   ├── v3-full/                         # this planning folder
│   ├── ui-system/                       # ported from workbench docs
│   └── architecture.md                  # link to this doc (or leave here and link from v3-full/README)
│
├── app.json
├── app.config.js
├── babel.config.js
├── eslint.config.js
├── metro.config.js
├── package.json
├── tsconfig.json
└── index.js
```

## Layer responsibilities

### `src/design-system/`

- Defines all visual tokens (palette, spacing, radius, type, motion, depth, glass, sound, haptics).
- Exposes hooks (`useGlass`, `useFonts`, `useSound`, `useHaptic`).
- Does not depend on domain or infrastructure. Pure.
- **Rule:** every color, size, spring timing, or shadow used in `components/` comes from `src/design-system/tokens/`. No ad-hoc values. Violations caught by review + lint where feasible.
- Ported verbatim from workbench `src/design-system/` (foundation, semantic, component, state, motion, registry) to avoid rebuilding a working token system. Glass is an addition from the wireframe that the workbench did not cover.

### `src/domain/`

- Types, entities, service interfaces, status enums.
- No React Native imports. No `import { View } from 'react-native'`. No side effects.
- Services defined as TS interfaces (e.g. `WalletService`, `MeshService`). Domain does not pick an implementation.
- `TransferStatus.ts` encodes the three locked strings as a union type with a literal type for each state. Use this everywhere transfer state is read/displayed.

### `src/infrastructure/`

- Implements domain interfaces with real side effects.
- One folder per adapter (`wallet/`, `solana/`, `ble/`, `lxmf/`, `stealth/`, `beacon/`, `fixtures/`).
- Adapters are injectable via `src/providers/AdapterProvider.tsx`. Tests and `/dev` inject fixtures.

### `src/hooks/`

- The only layer `components/` consumes.
- Hooks accept nothing (or UI-relevant params), read services from context, return React state + action callbacks.
- Translate domain concepts to UI-friendly shapes (e.g. format balance for display, map internal ids to strings).

### `components/`

- UI only. Consumes hooks and design tokens.
- Never imports from `src/infrastructure/`.
- Primitives are in `components/primitives/`; domain-specific components sit under `components/<area>/`.

### `app/`

- Expo-router routes. Thin. Glue primitives and components into a screen.
- Sets up providers at `_layout.tsx`.

## Fixture injection pattern

`AdapterProvider` reads an env var (`EXPO_PUBLIC_LAUNCH_PRESET` or `EXPO_PUBLIC_ADAPTERS=fixtures`) and injects either real or fixture adapters into context. `src/hooks/` reads adapters from context. Components do nothing different — same hooks, different underlying data.

This enables:

- `/dev` catalog preview: launch with fixtures, see every screen without real BLE/wallet.
- Deterministic screenshot tests later.
- Staged rollout of real adapters (e.g. turn on real BLE, keep LXMF stubbed, wallet real).

## Adapter swap-in contract

When a real adapter replaces a stub, the change is limited to:

1. Replace file in `src/infrastructure/<name>/`.
2. Update `src/infrastructure/<name>/index.ts` export.
3. If the real adapter has new config needs, update `AdapterProvider` wiring.

No component code changes. No hook signature changes. If either requires changes, either the stub was wrong or the domain interface needs a revision — update `src/domain/services/` first, then adapters, then hooks.

## Terminology lock (in code)

Define in `src/domain/status/TransferStatus.ts`:

```ts
export type TransferStatus = 'Queued on device' | 'Handed to mesh' | 'Settled';
```

Use this type everywhere. Do not let a `string` flow into a status display. Grep gate in `quality-gates.md` blocks banned synonyms.

## Theme provider

`src/providers/ThemeProvider.tsx` re-exports workbench's theme pattern. Components access theme via a `useTheme` hook that returns typed tokens. No inline style values; all values trace back to `src/design-system/tokens/`.

## Related

- [decisions.md](./decisions.md) — why these choices
- [screen-inventory.md](./screen-inventory.md) — surfaces that live on top of this
- [implementation-plan.md](./implementation-plan.md) — the scaffolding sequence
