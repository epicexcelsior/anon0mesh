# implementation-plan.md — v3-full step-by-step execution plan

File-by-file sequential plan. Execute top to bottom. Each phase ends with a `progress.md` entry + commit.

Read `decisions.md`, `architecture.md`, `screen-inventory.md`, and `quality-gates.md` first.

## How to use this plan

- Steps are ordered. Later steps often depend on earlier ones — do not reorder without reason.
- Each step lists **files touched**, **actions**, and **success criteria**.
- Success criteria must all pass before moving to the next step.
- If a step uncovers a decision not covered in `decisions.md`, pause, update `decisions.md`, then continue.
- Commit after each step (or logical group — see step headers).

## Prerequisites

Branch is `v3-full`, checked out from `upstream/main`. Confirmed in session 1 planning entry.

Source references to read from (on other branches or out-of-tree — do not import directly):

- Workbench: `git show epic/ui-workbench-fixtures:components/dev/workbench/<file>`
- v3 branch: `git show upstream/v3:mobile_app/<path>`
- Wireframe: `/home/epic/Downloads/Telegram Desktop/anonmesh_ui_ux/`
- Stitch screen map: `/home/epic/Downloads/anonmesh/design/SCREEN_MAP.md`

You may `git checkout <branch> -- <path>` to copy files in, then restage into the new structure.

---

## Phase 0 — Scaffolding

Goal: folder structure, tokens, primitives, provider shells, deps. No screens yet.

### Step 0.1 — Folder skeleton

**Files:** create empty folders and index barrels per `architecture.md` § "Folder structure".

```
app/ onboarding/ (tabs)/ send/ peers/ history/ settings/ messages/ dev/
components/{primitives,home,messages,send,mesh,settings,onboarding,shared}/
src/{design/tokens,domain/{entities,services,status},infrastructure/{wallet,solana,ble,lxmf,stealth,beacon,fixtures},hooks,providers,fixtures}/
assets/{brand,sounds,images,icons}/
docs/v3-full/ (exists), docs/ui-system/ (pending port)
```

**Actions:**
- Create folders.
- Each `src/<dir>/index.ts` gets a `export {}` placeholder.

**Success:** `find app components src assets -type d` matches architecture.md tree. TS compiles empty project.

**Commit:** `chore(scaffold): folder skeleton for v3-full`

### Step 0.2 — Dependencies

**Files:** `package.json`, `package-lock.json`.

**Actions:**
- Base deps from `upstream/main` `package.json` kept as-is.
- Add or upgrade these deps (versions verified against workbench + v3):
  - `@solana/web3.js`
  - `@solana-mobile/mobile-wallet-adapter-protocol`
  - `@solana-mobile/mobile-wallet-adapter-protocol-mobile`
  - `@noble/ciphers`, `@noble/curves`, `@noble/hashes`
  - `expo-secure-store`
  - `expo-local-authentication`
  - `expo-haptics`
  - `expo-audio` (`~1.1.1` per workbench)
  - `expo-blur` (`~15.0.8` per workbench)
  - `@expo/vector-icons` (Feather set)
  - `react-native-reanimated`
  - `react-native-gesture-handler`
  - `react-native-svg` (for wireframe custom icons)
  - `react-native-qrcode-svg`
  - `@react-native-async-storage/async-storage`
- Fonts: Space Grotesk, Manrope — already present on workbench (`useWorkbenchFonts`). Add JetBrains Mono.
- Add dev deps for lint/types if missing.
- `npm install`.

**Success:** `npm install` clean; `npx tsc --noEmit` passes with empty project.

**Commit:** `chore(deps): port deps from workbench/v3 for wallet/mesh/font/audio/blur/svg`

### Step 0.3 — Port workbench design-system verbatim

**Files (ported from workbench):**
- `src/design-system/tokens/foundation.ts`
- `src/design-system/tokens/semantic.ts`
- `src/design-system/tokens/component.ts`
- `src/design-system/tokens/state.ts`
- `src/design-system/tokens/motion.ts`
- `src/design-system/tokens/registry.ts`
- `src/design-system/tokens/index.ts`

**Actions:**

Copy the workbench design-system verbatim — this is a production-tested token system; do not rebuild.

```bash
git checkout epic/ui-workbench-fixtures -- src/design-system/
git status  # verify files staged
```

Then verify imports resolve:

```bash
npx tsc --noEmit
```

If the import in `foundation.ts` uses `@/src/design-system/tokens/foundation` (it does), confirm `tsconfig.json` on `v3-full` has the `@/*` path alias — port from workbench `tsconfig.json` if missing.

**Content check (after port):**
- `foundation.ts` defines `palette` (obsidian scale, cyan, amber, green, red, purple, slate, frost), `spacing`, `radius`, `type` scale, and `fonts` (Space Grotesk + Manrope setup).
- `semantic.ts` defines `semanticColorTokens` mapping palette to roles (background, surface, text tiers, cyan/amber/green/red/purple with soft/glow variants).
- `state.ts` holds `depth`, `feedback` (press config for DepthButton).
- `motion.ts` holds the overdamped springs + durations.
- `component.ts` holds component-scoped tokens.
- `registry.ts` powers the design-system catalog view used by `/dev`.
- `index.ts` exports `foundationTokens`, `semanticTokens`, `componentTokens`, `stateTokens`, `motionTokens`, plus the registry.

**Extend:** Add JetBrains Mono to `foundation.ts` `fonts` block (new key `mono`). This is the one addition on top of the verbatim port:

```ts
// foundation.ts — append to fonts:
mono: Platform.select({
  ios: 'JetBrainsMono-Regular',
  android: 'JetBrainsMono-Regular',
  default: 'monospace',
}),
```

**Success:** `import { foundationTokens, semanticTokens } from '@/src/design-system/tokens'` resolves; typecheck clean; `foundationTokens.palette.cyan500` === `'#00daf3'`.

**Commit:** `feat(design-system): port workbench tokens verbatim + add mono font slot`

### Step 0.4 — Fonts

**Files:**
- `assets/fonts/SpaceGrotesk-*.ttf`, `Manrope-*.ttf`, `JetBrainsMono-*.ttf`
- `src/design-system/useFonts.ts` (port from workbench `components/dev/workbench/useWorkbenchFonts.ts`)

**Actions:**

```bash
# Port TTFs from workbench
git checkout epic/ui-workbench-fixtures -- assets/fonts/
# Port the fonts hook
git checkout epic/ui-workbench-fixtures -- components/dev/workbench/useWorkbenchFonts.ts
mv components/dev/workbench/useWorkbenchFonts.ts src/design-system/useFonts.ts
```

After move, inside `useFonts.ts`:
- Rename `useWorkbenchFonts` → `useFonts`.
- Add JetBrains Mono TTFs to the font map.

Download JetBrains Mono (Regular + Medium) from https://fonts.google.com/specimen/JetBrains+Mono if not already in workbench. Place under `assets/fonts/`.

**Success:** In `app/_layout.tsx`, `const loaded = useFonts(); if (!loaded) return null;` works; fonts render in any text primitive.

**Commit:** `feat(design-system): port font loader + TTFs, add JetBrains Mono`

### Step 0.5 — Glass hook + BlurView integration

**Files:**
- `src/design-system/glass.ts` (new — variant config)
- `src/design-system/useGlass.ts`
- `components/primitives/GlassSurface.tsx`

**Actions:**

Workbench has `WorkbenchBlur.tsx` but not a 4-variant system. The wireframe defines 4 variants. Reconcile:

1. Port workbench `WorkbenchBlur.tsx` as a reference:

```bash
git show epic/ui-workbench-fixtures:components/dev/workbench/WorkbenchBlur.tsx
```

2. Create `src/design-system/glass.ts` with 4 variants matching wireframe `styles.css`:

```ts
export type GlassVariant = 'regular' | 'soft' | 'accent' | 'strong';

export const glassVariants: Record<GlassVariant, {
  overlay: string; blurIntensity: number; border: string;
}> = {
  regular: {
    overlay: 'rgba(255,255,255,0.045)',
    blurIntensity: 40,   // expo-blur scale, tuned
    border: 'rgba(255,255,255,0.1)',
  },
  soft: {
    overlay: 'rgba(255,255,255,0.03)',
    blurIntensity: 30,
    border: 'rgba(255,255,255,0.08)',
  },
  accent: {
    overlay: 'rgba(60,227,106,0.08)',
    blurIntensity: 40,
    border: 'rgba(60,227,106,0.22)',
  },
  strong: {
    overlay: 'rgba(255,255,255,0.07)',
    blurIntensity: 60,
    border: 'rgba(255,255,255,0.14)',
  },
};
```

3. `src/design-system/useGlass.ts`: hook returning resolved variant config.

4. `components/primitives/GlassSurface.tsx`: wraps children in `<BlurView intensity=... />` from `expo-blur`, with an overlay `<View />` at matching bg color + border, optional drop shadow. Props: `variant`, `style`, `children`.

**Acceptance smoke test:** Add a temporary dev screen rendering each variant side-by-side; verify visually on device that each blurs differently.

**Success:** `<GlassSurface variant="strong">Hi</GlassSurface>` shows distinct blur vs other variants.

**Commit:** `feat(design-system): glass factory with 4 variants (wireframe ported)`

### Step 0.6 — Core primitives

**Files (ports from workbench):**
- `components/primitives/DepthButton.tsx` ← `components/dev/workbench/DepthButton.tsx`
- `components/primitives/Sheet.tsx` ← `components/dev/workbench/WorkbenchSheet.tsx` (renamed)
- `components/primitives/SlideToConfirm.tsx` ← workbench version (keep shadow-twin; no Skia)
- `components/primitives/NumericKeypad.tsx` ← workbench version
- `components/primitives/BottomNav.tsx` ← `components/dev/workbench/WorkbenchBottomNav.tsx` (renamed, will be used by `app/(tabs)/_layout.tsx`)
- `components/primitives/Backdrop.tsx` ← `components/dev/workbench/WorkbenchBackdrop.tsx` (renamed)
- `components/primitives/primitives.tsx` ← workbench (the shared atomic primitives file)

**Files (new):**
- `components/primitives/Pill.tsx` — extract from wireframe `shell.jsx` `Pill`
- `components/primitives/SegmentedControl.tsx` — standard segmented, 2–3 segments, uses `depth` token
- `components/primitives/TextInput.tsx` — wraps RN `TextInput` with tokens
- `components/primitives/SectionLabel.tsx` — wireframe pattern
- `components/primitives/SignalBars.tsx` — wireframe pattern
- `components/primitives/Icon.tsx` — Feather + custom SVG registry
- `components/primitives/index.ts` — barrel

**Actions:**

```bash
# Port workbench primitives
for f in DepthButton.tsx WorkbenchSheet.tsx SlideToConfirm.tsx NumericKeypad.tsx \
         WorkbenchBottomNav.tsx WorkbenchBackdrop.tsx primitives.tsx; do
  git checkout epic/ui-workbench-fixtures -- "components/dev/workbench/$f"
done
mkdir -p components/primitives
git mv components/dev/workbench/DepthButton.tsx      components/primitives/DepthButton.tsx
git mv components/dev/workbench/WorkbenchSheet.tsx   components/primitives/Sheet.tsx
git mv components/dev/workbench/SlideToConfirm.tsx   components/primitives/SlideToConfirm.tsx
git mv components/dev/workbench/NumericKeypad.tsx    components/primitives/NumericKeypad.tsx
git mv components/dev/workbench/WorkbenchBottomNav.tsx components/primitives/BottomNav.tsx
git mv components/dev/workbench/WorkbenchBackdrop.tsx  components/primitives/Backdrop.tsx
git mv components/dev/workbench/primitives.tsx       components/primitives/primitives.tsx
rmdir components/dev/workbench components/dev 2>/dev/null || true
```

Inside each moved file:
- Rename exported symbol from `WorkbenchSheet` → `Sheet`, `WorkbenchBottomNav` → `BottomNav`, `WorkbenchBackdrop` → `Backdrop`.
- Fix imports from `@/components/dev/workbench/<x>` → `@/components/primitives/<x>`.
- Fix imports from `@/components/dev/workbench/theme` → `@/src/design-system/tokens`.

Write the new primitives (`Pill`, `SegmentedControl`, `TextInput`, `SectionLabel`, `SignalBars`, `Icon`) using ported tokens only.

**Success:** A smoke-test dev screen imports all primitives and renders without error; lint passes; typecheck clean.

**Commit (grouped, but each primitive = 1 commit if clean):**
1. `refactor(primitives): move workbench primitives to components/primitives/ with renames`
2. `feat(primitives): Pill, SegmentedControl, TextInput, SectionLabel, SignalBars, Icon`

### Step 0.7 — Workbench sound + haptics wiring

**Files:**
- `assets/sounds/` (6 WAVs from workbench `assets/sounds/workbench/`)
- `src/design-system/sound.ts` ← workbench `components/dev/workbench/sound.ts`
- `src/design-system/soundCatalog.ts` ← workbench `components/dev/workbench/soundCatalog.ts`
- `src/design-system/useSound.ts` (factor hook out of sound.ts if coupled)
- `src/design-system/haptics.ts` ← workbench `components/dev/workbench/haptics.ts`
- `src/design-system/useHaptic.ts` (factor hook out)

**Actions:**

```bash
git checkout epic/ui-workbench-fixtures -- assets/sounds/workbench/
git mv assets/sounds/workbench assets/sounds/system   # or keep under /workbench/ if referenced by filename
git checkout epic/ui-workbench-fixtures -- \
  components/dev/workbench/sound.ts \
  components/dev/workbench/soundCatalog.ts \
  components/dev/workbench/haptics.ts
git mv components/dev/workbench/sound.ts        src/design-system/sound.ts
git mv components/dev/workbench/soundCatalog.ts src/design-system/soundCatalog.ts
git mv components/dev/workbench/haptics.ts      src/design-system/haptics.ts
```

Fix imports inside each file. Update sound file path references if you renamed the asset folder.

Ensure primitives (`DepthButton`, `SlideToConfirm`) fire the catalog events by name:
- `DepthButton.onPress` → `playSound('press')` + `hapticLight`.
- `SlideToConfirm.onConfirm` → `playSound('confirm')` + `hapticMedium`.

**Success:** Press `DepthButton` on device: haptic tick + sound. Slide `SlideToConfirm` to complete: stronger haptic + confirm sound.

**Commit:** `feat(design-system): port sound catalog + haptics, wire into primitives`

### Step 0.8 — Logo + brand assets

**Files:**
- `assets/brand/anonmesh-logo.png` (copy from v3 `mobile_app/assets/images/logos/anonmesh_logo.png`)
- `assets/brand/anonmesh-logo@2x.png`, `@3x.png` if available
- `assets/brand/anonmesh-wordmark.svg` (optional; generate SVG text placeholder if no asset exists)

**Actions:**
- `git checkout upstream/v3 -- mobile_app/assets/images/logos/` then move files to `assets/brand/`.
- Add wordmark placeholder in Space Grotesk if asset not found.

**Success:** `<Image source={require('@/assets/brand/anonmesh-logo.png')} />` renders.

**Commit:** `chore(assets): port Anonmesh logo + add brand/ folder`

### Step 0.9 — Custom icons

**Files:**
- `assets/icons/` (or `components/primitives/icons/`)
- `components/primitives/Icon.tsx` (extend to register custom SVGs)

**Actions:**
- Port from `anonmesh_ui_ux/icons.jsx`: mesh-nodes, signal, identity-chip, beacon, lock-mesh, stealth. Convert JSX to RN-compatible SVG via `react-native-svg` (install if absent).
- `Icon.tsx` dispatches by name: if name matches Feather, use Feather; else use custom registry.

**Success:** `<Icon name="mesh-nodes" size={20} color={colors.mesh} />` renders custom SVG.

**Commit:** `feat(primitives): custom mesh-specific icons from wireframe`

### Step 0.10 — Eslint import-direction rule

**Files:** `eslint.config.js`

**Actions:** Add `no-restricted-imports` or `import/no-restricted-paths` rule enforcing:
- `components/` may not import from `src/infrastructure/`.
- `src/hooks/` may not import from `components/` or `src/infrastructure/`.
- `src/domain/` may not import from `src/infrastructure/`, `src/hooks/`, `components/`, or `react-native`.

**Success:** `npm run lint` errors if an intentional bad import is added; passes on current code.

**Commit:** `chore(lint): enforce layer import direction`

### Step 0.11 — Root providers skeleton

**Files:**
- `src/providers/AdapterProvider.tsx`
- `src/providers/ThemeProvider.tsx`
- `src/providers/WalletProvider.tsx`
- `src/providers/MeshProvider.tsx`

**Actions:**
- `AdapterProvider`: context holding the current set of adapters (wallet, mesh, etc.). Reads env to pick real vs fixture. Default to real; `EXPO_PUBLIC_ADAPTERS=fixtures` forces fixtures.
- `ThemeProvider`: thin re-export of tokens behind a `useTheme` hook.
- `WalletProvider` / `MeshProvider`: wrap `AdapterProvider` and expose domain-shaped state. Empty for now; return stubs returning empty arrays / null values.

**Success:** `_layout.tsx` can compose them without errors.

**Commit:** `feat(providers): adapter + theme + wallet + mesh provider skeletons`

### Step 0.12 — Domain interfaces + status lock

**Files:**
- `src/domain/entities/{Peer,Message,Transaction,Wallet,Identity}.ts`
- `src/domain/services/{WalletService,TransactionService,MeshService,MessagingService,BeaconService}.ts` (interfaces only)
- `src/domain/status/TransferStatus.ts`
- `src/domain/index.ts`

**Actions:**
- Define entity types concretely. Use literal unions for enums.
- Define service interfaces with method signatures only. No implementation.
- `TransferStatus` = `'Queued on device' | 'Handed to mesh' | 'Settled'`.

**Success:** Typecheck clean. Import `import type { WalletService, TransferStatus } from '@/src/domain'` works.

**Commit:** `feat(domain): entities, service interfaces, TransferStatus lock`

---

## Phase 1 — Navigation shell

Goal: app boots, renders landing, navigates through onboarding to tab shell. Empty tab screens fine.

### Step 1.1 — Root layout

**Files:** `app/_layout.tsx`

**Actions:**
- Load fonts with `useFonts`.
- Compose providers: `AdapterProvider` → `ThemeProvider` → `WalletProvider` → `MeshProvider` → `Stack` (expo-router).
- `StatusBar` config (dark).
- SafeAreaProvider.
- GestureHandlerRootView.

**Success:** App boots, no crash, empty screen.

**Commit:** `feat(app): root layout with providers, fonts, status bar`

### Step 1.2 — Landing

**Files:** `app/index.tsx`, `components/onboarding/LandingCanvas.tsx`

**Actions:**
- Full-screen layout: logo (Image), wordmark, single CTA `DepthButton` "ENTER THE MESH", version footer.
- `LandingCanvas`: placeholder gradient background. Real mesh-particle viz deferred to polish pass.
- On CTA press: router.push('/onboarding/welcome').

**Success:** Tap CTA navigates to welcome.

**Commit:** `feat(landing): landing screen + CTA to onboarding`

### Step 1.3 — Onboarding Welcome

**Files:** `app/onboarding/welcome.tsx`, `components/onboarding/FeatureHighlight.tsx`

**Actions:**
- Headline "Private by default".
- 3-4 FeatureHighlight cards (mesh, private, on-chain, offline).
- Two CTAs: "GET STARTED" (primary, → setup), "I have an identity" (secondary, → import flow — stub for now).
- "Under the hood" small text link → `/onboarding/tech-drawer` (modal).

**Success:** Navigates to setup on primary CTA.

**Commit:** `feat(onboarding): welcome screen with feature highlights`

### Step 1.4 — Onboarding Setup

**Files:** `app/onboarding/setup.tsx`, `components/onboarding/{PermissionPrimer,WalletPathPicker}.tsx`

**Actions:**
- Display name input (optional).
- Auto-generated mesh alias preview (random adjective+animal for now, swap to real keypair-derived later).
- PermissionPrimer cards (Bluetooth, Notifications) — copy-only, no toggles.
- WalletPathPicker: Create New (local) / Connect (MWA). MWA button disabled on iOS.
- CTA "ENTER THE MESH":
  - Fire OS permission dialogs (Bluetooth, Notifications). Do not block on decline.
  - Trigger wallet create/connect via `useWallet` (stubbed until Phase 5).
  - Navigate to `(tabs)/home`.

**Success:** Tap CTA → Home.

**Commit:** `feat(onboarding): setup screen with permission priming + wallet path picker`

### Step 1.5 — Tech deep-dive drawer

**Files:** `app/onboarding/tech-drawer.tsx`, `components/onboarding/TechDrawerContent.tsx`

**Actions:**
- Presented as modal (expo-router modal preset).
- Scrollable. 4 short sections: LXMF, Reticulum, BLE mesh, Solana stealth. 1–2 paragraphs each. Link out to sources.
- Close button.

**Success:** Opens, scrolls, closes.

**Commit:** `feat(onboarding): tech deep-dive drawer`

### Step 1.6 — Tab layout

**Files:** `app/(tabs)/_layout.tsx`, `components/shared/TabBar.tsx`

**Actions:**
- Custom `TabBar` with flush glass-strong surface, safe-area pad, 3 tabs (Home/Messages/Settings), larger active highlight + sliding indicator (port workbench tab bar animation).
- No floating.

**Success:** 3 tabs render. Tab switch animates.

**Commit:** `feat(tabs): tab layout with glass-strong flush tab bar`

### Step 1.7 — Empty tab screens

**Files:** `app/(tabs)/{home,messages,settings}.tsx`

**Actions:** Placeholder screen bodies with screen name. Hooks will replace content in subsequent phases.

**Success:** Each tab renders, doesn't crash.

**Commit:** `feat(tabs): empty Home, Messages, Settings screens`

---

## Phase 2 — Home tab + Send flow + Peers

Biggest phase. Split into sub-phases; commit per surface.

### Step 2.1 — Home shell + global MeshStatusStrip

**Files:** `app/(tabs)/home.tsx`, `app/(tabs)/_layout.tsx` (edit), `components/home/{HomeHero,BalanceCard,RecentActivity}.tsx`, `components/mesh/MeshStatusStrip.tsx`

**Actions:**
- Create `MeshStatusStrip` in `components/mesh/` (NOT `components/home/`) — D6 locks it as persistent across all tabs, not Home-only.
- Wire it into `app/(tabs)/_layout.tsx` so it renders above the tab screen content on every tab (below safe-area status bar, above Home/Messages/Settings). Tab screens pad their top to make room.
- Home layout (top to bottom, inside the mesh strip's padding): header (identity chip left, QR icon right) → BalanceCard (big SOL + USD numerals, `glass-strong`) → action row (Send / Receive / History buttons) → SegmentedControl (Balance | History) → scrollable list.
- `BalanceCard` reads from `useWallet` (stubbed, returns 0 for now).
- `MeshStatusStrip` reads from `useMesh` (stubbed, returns 0 nodes); glass-soft, ≈32px, tap is a no-op for now (wires up in Step 2.4).
- `RecentActivity` reads from `useTransaction.recent` (stubbed, empty).

**Success:** Home renders with placeholder zeros. Mesh strip visible on Home, Messages, and Settings.

**Commit:** `feat(home): hero layout + persistent mesh status strip across tabs (D6)`

### Step 2.2 — Hooks wiring (stub state)

**Files:** `src/hooks/{useWallet,useMesh,useTransaction,usePeers,useMessages,useBeacon,useLxmf,useOnboarding}.ts`

**Actions:**
- Each hook: read adapters from `AdapterProvider` context, expose React state + action callbacks.
- Adapters still stubs at this point; hooks shape the React surface.
- `useLxmf` shape must mirror `@lxmf/react-native`'s public API (see `lxmf-brief.md`).

**Success:** Compiles. Home reads data (zeros). Consistent pattern across hooks.

**Commit:** `feat(hooks): core hooks scaffolded with stub adapters`

### Step 2.3 — Fixture adapters + /dev launch preset

**Files:** `src/infrastructure/fixtures/{FixtureMeshAdapter,FixtureWalletAdapter,FixtureMessagingAdapter,FixtureTransactionAdapter}.ts`, `src/fixtures/{peers,conversations,transactions,presets}.ts`, `app/dev/index.tsx`

**Actions:**
- Port workbench fixtures (`src/dev/fixtures/`) and presets (`src/testing/presets.ts`) into new locations.
- Fixture adapters return fixture data in domain shapes.
- `AdapterProvider` swaps to fixtures when `EXPO_PUBLIC_ADAPTERS=fixtures`.
- `/dev` catalog route — gate to `__DEV__`; replicate workbench's catalog UI listing each preview screen.

**Success:** `EXPO_PUBLIC_ADAPTERS=fixtures npx expo start` renders Home with fixture balance + 7 nodes + fixture activity. `/dev` lists every screen.

**Commit:** `feat(fixtures): port workbench fixtures + presets; wire /dev catalog route`

### Step 2.4 — Mesh status strip (wired)

**Files:** `components/mesh/MeshStatusStrip.tsx` (already created in Step 2.1 under `components/mesh/`)

**Actions:**
- Reads from `useMesh` (now real via hook wiring from Step 2.2).
- Shows `<NN> nodes`, iface, signal bars, connection state chip.
- Tap opens Peers sheet (`router.push('/peers')`).
- Mesh-terminal styling (mono numerals, green tint only on this surface). Tinting should adapt per tab via theme's Backdrop preset token.

**Success:** Tap navigates to Peers sheet (pending step 2.5).

**Commit:** `feat(mesh): mesh status strip wired to useMesh`

### Step 2.5 — Peers sheet

**Files:** `app/peers/index.tsx`, `components/mesh/{PeersList,PeerCard}.tsx`

**Actions:**
- Presented as modal bottom sheet (`Sheet` primitive, large height).
- Header: summary (node count, iface, signal).
- List: PeerCard rows with identity, signal, last-seen, beacon-stake badge, inline action buttons (message, send).
- Empty + loading + permission-denied states.

**Success:** Renders fixture peers under `/dev` preset. Tap peer → peer detail.

**Commit:** `feat(peers): peers sheet with list and empty/error states`

### Step 2.6 — Peer detail

**Files:** `app/peers/[peerId].tsx`, `components/mesh/PeerDetail.tsx`

**Actions:**
- Push screen from peer row tap.
- Identity header, connection stats, mesh routing info, encryption status, beacon stake if applicable.
- Actions: Send Message, Send Payment.

**Success:** Tap peer from sheet → detail with fixture data.

**Commit:** `feat(peers): peer detail screen`

### Step 2.7 — Send flow — Recipient

**Files:** `app/send/recipient.tsx`, `components/send/RecipientPicker.tsx`

**Actions:**
- Input: paste address, QR scan button (opens scanner), select mesh peer (opens a mini PeersList).
- Validate address format before enabling Next.

**Success:** Next button enabled on valid address; navigates to amount.

**Commit:** `feat(send): recipient picker with address input + mesh peer select`

### Step 2.8 — Send flow — Amount

**Files:** `app/send/amount.tsx`, `components/send/AmountKeypad.tsx`

**Actions:**
- Numeric keypad + amount display.
- SOL + USD live conversion.
- Balance check; disable Next if over balance.
- "Use max" button.

**Success:** Amount + balance math correct; Next → Review.

**Commit:** `feat(send): amount keypad with balance check`

### Step 2.9 — Send flow — Review

**Files:** `app/send/review.tsx`, `components/send/ReviewCard.tsx`

**Actions:**
- Summary: recipient (short address + mesh alias if known), amount, estimated fee, route (on-chain vs mesh-relayed based on recipient type), privacy toggle (stealth).
- SlideToConfirm at bottom. On slide complete: call `useTransaction.submit`, navigate to success screen.

**Success:** Slide triggers submit; navigates to Success.

**Commit:** `feat(send): review screen with SlideToConfirm`

### Step 2.10 — Send flow — Success

**Files:** `app/send/success.tsx`, `components/send/SuccessCard.tsx`

**Actions:**
- Checkmark + amount sent + tx signature (short, copy action).
- Status chip showing `TransferStatus` — will animate through `Queued on device` → `Handed to mesh` → `Settled` once real runtime lands.
- Actions: Done (→ Home), View on Explorer, Share Receipt.

**Success:** Renders, Done returns to Home.

**Commit:** `feat(send): success screen with transfer status chip`

### Step 2.11 — Receive

**Files:** `app/receive.tsx`, `components/shared/ReceiveCard.tsx`

**Actions:**
- QR code of wallet address (use `react-native-qrcode-svg`).
- Address text + copy action.
- Share action.
- Optional "request amount" input (modifies URI).

**Success:** QR renders correctly; copy works; share sheet opens.

**Commit:** `feat(receive): QR + address share`

### Step 2.12 — History + Transaction detail

**Files:** `app/history/index.tsx` (or integrate into home.tsx history segment), `app/history/[txId].tsx`, `components/home/HistoryList.tsx`, `components/shared/TxRow.tsx`, `components/shared/TxDetail.tsx`

**Actions:**
- History list: TxRow per transaction (type icon, amount, counterparty label, TransferStatus chip).
- TxDetail: full details page pushed from TxRow.

**Success:** Renders fixture tx list; tap row → detail.

**Commit:** `feat(history): transaction history list + detail`

### Step 2.13 — Home segment toggle

**Files:** `app/(tabs)/home.tsx` (update)

**Actions:**
- Wire SegmentedControl to swap Recent Activity view with full HistoryList.

**Success:** Toggling updates list content.

**Commit:** `feat(home): segmented control Balance ↔ History`

---

## Phase 3 — Messages tab

### Step 3.1 — Messages list

**Files:** `app/(tabs)/messages.tsx`, `components/messages/{ConversationRow,ConversationList}.tsx`

**Actions:**
- Header: "Messages" + "New" action (opens new-conversation sheet).
- ConversationRow: avatar, peer alias, last-message preview, timestamp, unread dot, lock icon for encrypted.
- Reads from `useMessages.list`.

**Success:** Renders fixture conversations.

**Commit:** `feat(messages): conversation list`

### Step 3.2 — New conversation sheet

**Files:** `components/messages/NewConversationSheet.tsx`

**Actions:**
- Bottom sheet. Search bar + list of peers (from `usePeers`).
- Tap peer → open conversation.
- Port pattern from v3 `components/messages/PeersDrawer`.

**Success:** Tapping peer opens conversation detail.

**Commit:** `feat(messages): new conversation sheet from peers`

### Step 3.3 — Conversation detail

**Files:** `app/messages/[peerId].tsx`, `components/messages/{MessageBubble,ComposerBar}.tsx`

**Actions:**
- Header: peer avatar + alias + encryption state.
- Scrolling thread of MessageBubbles (sent/received styling, timestamps, lock icons, read receipts if supported).
- ComposerBar at bottom: input + send button.
- Send calls `useMessages.send(peerId, text)`. Message appears optimistically with status `Queued on device`.

**Success:** Sending a message adds it to the thread with status chip.

**Commit:** `feat(messages): conversation detail with composer`

---

## Phase 4 — Settings tab

### Step 4.1 — Settings home

**Files:** `app/(tabs)/settings.tsx`, `components/settings/{SettingsSection,SettingsRow,IdentityCard}.tsx`

**Actions:**
- IdentityCard at top (display name, alias, QR icon → identity modal).
- Sections: Network, Privacy, Beacon, Wallet, About.
- Each row navigates to its sub-page.

**Success:** Renders and navigates to all sub-pages (pending subsequent steps).

**Commit:** `feat(settings): home with sections`

### Step 4.2 — Identity modal

**Files:** `app/settings/identity.tsx`

**Actions:**
- QR code of identity.
- Display name edit.
- Mesh alias display.
- Export identity action.

**Success:** Edit persists via `useWallet.setDisplayName`.

**Commit:** `feat(settings): identity modal`

### Step 4.3 — Wallet export

**Files:** `app/settings/wallet-export.tsx`

**Actions:**
- Requires biometric unlock (`expo-local-authentication`).
- After unlock: show seed phrase (local wallet only) or public key only (MWA).
- Strong warnings copy.

**Success:** Biometric prompt fires; seed displayed on success.

**Commit:** `feat(settings): wallet export with biometric gate`

### Step 4.4 — Network config

**Files:** `app/settings/network.tsx`

**Actions:**
- BLE on/off toggle → calls `useMesh.setBleEnabled`.
- LXMF mode picker: `BleOnly / TcpClient / TcpServer / Reticulum` from the LXMF public API. Writes to config; no-op until parallel agent lands.
- LoRa toggle (disabled placeholder).
- Auto-connect toggle.

**Success:** Toggles update state via useMesh; persisted via prefs service.

**Commit:** `feat(settings): network config with BLE/LXMF mode`

### Step 4.5 — Privacy toggles

**Files:** `app/settings/privacy.tsx`

**Actions:**
- Stealth default toggle (controls default state of Send flow's stealth toggle).
- Tx privacy mode picker.
- Key rotation cadence picker.

**Success:** Toggles persist.

**Commit:** `feat(settings): privacy toggles`

### Step 4.6 — Beacon registry

**Files:** `app/settings/beacon.tsx`

**Actions:**
- Status card: current stake (stub 0), earnings (stub 0).
- "Become a beacon" CTA → stake flow screen (UI only — backend stub).
- Clear "coming soon" state after review screen.

**Success:** UI renders; stake flow ends at "coming soon" placeholder screen.

**Commit:** `feat(settings): beacon registry UI (backend stub)`

### Step 4.7 — About

**Files:** `app/settings/about.tsx`

**Actions:**
- Version, build, git SHA (if exposed), licenses link, "how this works" (reuses TechDrawerContent).

**Success:** Renders; links open.

**Commit:** `feat(settings): about page`

---

## Phase 5 — Backend wiring (real adapters)

Replace stub adapters with real or ported implementations.

### Step 5.1 — Local wallet adapter

**Files:** `src/infrastructure/wallet/LocalWallet/LocalWalletAdapter.ts`

**Actions:**
- Port from v3 `mobile_app/src/infrastructure/wallet/LocalWallet/LocalWalletAdapter.ts`.
- Verify SecureStore encryption + biometric serialization work with current Expo SDK.

**Success:** Create wallet in onboarding flow produces a real pubkey; persists across app restart.

**Commit:** `feat(wallet): port LocalWalletAdapter from v3`

### Step 5.2 — MWA adapter

**Files:** `src/infrastructure/wallet/MWA/MWAWalletAdapter.ts`

**Actions:**
- Port from v3.
- Android-only gate.
- Test connect flow via devnet (keep mainnet-beta default from v3 if not dev).

**Success:** Connect MWA in onboarding returns a real pubkey on Android.

**Commit:** `feat(wallet): port MWA adapter from v3 (Android)`

### Step 5.3 — Solana transaction service

**Files:** `src/infrastructure/solana/SolanaTransactionService.ts`

**Actions:**
- Port from v3 `mobile_app/src/domain/services/SolanaTransactionService.ts` (note: in v3 it's in domain; in v3-full it lives in infrastructure because it holds connection state and is side-effectful). Split: pure logic (quote, validate) stays in `src/domain/services/`; the `SolanaAdapter` implementing `TransactionService` goes in `src/infrastructure/solana/`.

**Success:** `useWallet.getBalance` returns real devnet balance after wallet connect.

**Commit:** `feat(solana): port and split SolanaTransactionService — infra adapter + domain pure`

### Step 5.4 — BLE mesh context

**Files:** `src/infrastructure/ble/{MeshBLEContext.tsx,BLEMeshAdapter.ts}`

**Actions:**
- Port from v3 `mobile_app/src/contexts/MeshBLEContext.tsx` (or v2 path if v3 lacks it).
- Wrap as `BLEMeshAdapter` implementing `MeshService`.
- Exposes: start/stop, node list, signal, iface.

**Success:** With BLE permission granted, node count in mesh status strip reflects real peers when nearby.

**Commit:** `feat(mesh): port MeshBLE + wrap as MeshAdapter`

### Step 5.5 — LXMF stub adapter

**Files:** `src/infrastructure/lxmf/LxmfStubAdapter.ts`

**Actions:**
- Implements the same surface as `@lxmf/react-native`'s `useLxmf` but returns empty state.
- API: `{ start, stop, send, status, beacons, events }` per package README.
- Added to `AdapterProvider` so swap to real package is just a re-export change.

**Success:** `useLxmf` is callable; returns empty state; does not crash.

**Commit:** `feat(lxmf): stub adapter mirroring @lxmf/react-native public API`

### Step 5.6 — Stealth + beacon stubs

**Files:** `src/infrastructure/stealth/StealthQueueAdapter.ts`, `src/infrastructure/beacon/BeaconAdapter.ts`

**Actions:**
- Both stubs. Return mock IDs / placeholder data. Typed to the domain interfaces so later real impls drop in.

**Success:** Stealth toggle in Send flow works (writes to state); beacon UI shows placeholder.

**Commit:** `feat(stealth,beacon): placeholder adapters`

### Step 5.7 — Provider composition finalize

**Files:** `src/providers/AdapterProvider.tsx` + `_layout.tsx`

**Actions:**
- Wire real adapters by default; fixtures via `EXPO_PUBLIC_ADAPTERS=fixtures`.
- Confirm import-direction lint passes.

**Success:** Normal launch uses real adapters; `/dev` still uses fixtures.

**Commit:** `feat(providers): finalize adapter composition — real by default, fixtures for /dev`

---

## Phase 6 — Polish

### Step 6.1 — Empty / loading / error states

For each list/surface, add the three states with copy:

- Home (no balance yet, loading balance)
- Peers sheet (scanning, no peers, permission denied)
- Messages list (no conversations yet)
- Conversation (no messages yet)
- Transaction history (no txs)
- Wallet export (biometric failed)
- Network (BLE off, permission denied)

**Commit:** per-surface or grouped: `feat(polish): empty / loading / error states`

### Step 6.2 — Motion timing pass

Audit every transition. Ensure:
- No bounce anywhere (overshootClamping true).
- DepthButton 80/160ms press/release.
- Sheet open/close uses workbench spring.
- Tab bar active-indicator slides smoothly.

**Commit:** `feat(polish): motion timing audit`

### Step 6.3 — Sound + haptic tuning

Play through every primary interaction; verify the right event fires. Adjust volumes in `soundCatalog`.

**Commit:** `feat(polish): sound + haptic tuning`

### Step 6.4 — Accessibility pass

- Every interactive has `accessibilityRole` + `accessibilityLabel`.
- Color contrast spot-check on all semantic tokens.
- VoiceOver / TalkBack focus order sane on all screens.

**Commit:** `feat(a11y): accessibility pass`

### Step 6.5 — Copy pass

- Read every string in UI.
- Apply terminology lock (grep check from quality-gates.md).
- Ensure no banned synonyms; ensure tone matches workbench (calm, trust-forward).

**Commit:** `docs/polish(copy): terminology + tone pass`

---

## Phase 7 — Final gates

### Step 7.1 — Grep terminology check

Run the grep commands from `quality-gates.md`. Fix any hits.

### Step 7.2 — Lint + typecheck clean

`npm run lint` and `npx tsc --noEmit` both zero errors.

### Step 7.3 — Full visual walkthrough

Launch the app. Walk every screen in `screen-inventory.md`. Confirm each acceptance bullet from `quality-gates.md`.

### Step 7.4 — Update docs

- `progress.md`: final session block.
- `decisions.md`: mark any open-questions sections resolved.
- Update mempool: `docs/02-repos/mobile-app.md` profile with the new branch state; update ADR 0004 status if needed.

### Step 7.5 — PR to main

- Open PR from `v3-full` to `main` (or wherever the team merges).
- Summary lists phases, decision IDs implemented, known deferrals.
- Tag team lead for review.

**Commit (merge):** handled by PR workflow.

---

## Approximate order of work

Phase 0 is prerequisite. Phases 1 + 5 can start in parallel with Phase 0 once tokens + primitives land. Phases 2, 3, 4 can run in parallel across multiple agents if the adapter + token layer is stable.

Suggested single-agent linear execution: 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7.

Suggested two-agent split (one agent backend, one frontend): Agent A does 0 + 5 in parallel with Agent B doing 1 + 2 + 3 + 4. Converge at 6.

## Related

- [decisions.md](./decisions.md)
- [architecture.md](./architecture.md)
- [screen-inventory.md](./screen-inventory.md)
- [quality-gates.md](./quality-gates.md)
- [progress.md](./progress.md)
- [handoff.md](./handoff.md)
- [lxmf-brief.md](./lxmf-brief.md)
