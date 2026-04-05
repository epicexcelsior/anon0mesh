# AnonMesh UI Redesign — Living Context Document

## Branch: `feature/ui-redesign` (off `v2`)
## Status: UI redesign aligned to current app capabilities. Build, lint, typecheck, and web export all pass.
## Last Updated: 2026-04-04

> This document is the single source of truth for the UI redesign.
> Read this before making any changes. Update it after every phase.

---

## Key Decisions (Confirmed by User)

1. **Canonical Stitch screens**: The currently favorited screens in Stitch project `13755964089108508928` are the canonical designs. Always use `mcp__stitch__list_screens` to fetch the latest.
2. **Wallet History**: `[Balance | History]` segmented control inside the Wallet tab — NOT a separate route. Done.
3. **Icons**: Keep Phosphor React Native. No migration to Material Symbols.
4. **Mesh tab**: Keep zone system, restyle to VP. Constellation visualization deferred to post-redesign.
5. **Constellation placeholder**: Static styled peer list for now (not animated node graph).
6. **Swap feature**: Removed from wallet (was "Coming Soon"). Not in Stitch designs.
7. **Quality bar**: Production-grade. Never diminish as "fine for hackathon."
8. **Device target**: Solana Mobile Seeker (Android, ~360x800dp, AMOLED).

---

## Stitch Screen Mapping

| Screen | Stitch Title | Screen ID |
|--------|-------------|-----------|
| Landing | AnonMesh Immersive Landing Refined | `15f3cff6` |
| Onboarding Welcome | Onboarding Welcome | `8382be53` |
| Onboarding Setup | Anonmesh Onboarding Setup | `c66bfa9b` |
| Chat List | Chat List | `9fbf00ad` |
| Chat Conversation | Anonmesh Chat Refined Readability | `c07cb245` |
| Chat Select Peer | New Chat Select Peer | `0a463364` |
| Wallet Dashboard | Wallet Dashboard | `5ffc9f80` |
| Wallet (Branded v3) | Anonmesh Wallet Branded v3 | `fca76275` |
| Wallet Refined Nav v4 | Anonmesh Wallet Refined Navigation v4 | `a0e8b895` |
| History | Anonmesh History Refined Nav v5 | `09ec8c25` |
| History Branded v2 | Anonmesh History Branded v2 | `e6f92ec6` |
| Send Payment | Anonmesh Send Payment Refined | `73c0fe68` |
| Receive Payment | Receive Payment | `adf60cb5` |
| Transaction Success | Transaction Success | `715fb336` |
| Mesh Constellation | Anonmesh Mesh Constellation Branded | `b131d61e` |
| Mesh Zone | Anonmesh Mesh Zone Branded v3 | `330935ec` |
| Peer Detail | Peer Detail: phantom_node_7 | `16977199` |
| Profile Branded v5 | Anonmesh Profile Branded v5 | `31d6c2b7` |
| Profile Refined Nav v2 | Anonmesh Profile Refined Navigation v2 | `fafb1787` |
| Settings | Anonmesh Settings Refined | `e4bedc72` |
| Onboarding Ready | Onboarding: Ready Refined | `4ebaf023` |

---

## Design System: Void Protocol

**Source of truth**: `constants/void-protocol.ts` (import as `VP`)

| Token | Value | Usage |
|-------|-------|-------|
| `VP.colors.void` | `#050A0A` | Every screen background |
| `VP.colors.surface` | `#0a1214` | Card backgrounds |
| `VP.colors.surfaceElevated` | `#0f1a1e` | Elevated cards |
| `VP.colors.ghostBorder` | `rgba(255,255,255,0.05)` | Subtle borders |
| `VP.colors.text.primary` | `#dee4e3` | Main text (NOT pure white) |
| `VP.colors.text.secondary` | `#8a9a9a` | Muted text |
| `VP.colors.text.disabled` | `#4a5555` | Disabled/placeholder |
| `VP.colors.text.inverse` | `#050A0A` | Text on cyan buttons |
| `VP.colors.accent.cyan` | `#22D3EE` | All interactive elements |
| `VP.colors.accent.cyanMuted` | `rgba(34,211,238,0.15)` | Subtle cyan bg |
| `VP.colors.accent.purple` | `#8B5CF6` | Stealth/privacy ONLY |
| `VP.colors.accent.purpleMuted` | `rgba(139,92,246,0.15)` | Subtle purple bg |
| UI Font | Space Grotesk | All UI text |
| Mono Font | JetBrains Mono | Addresses, hashes, balances |
| Icons | Phosphor React Native | Outlined weight |

### Typography Scale
- `pageTitle`: 28px SpaceGrotesk-Bold
- `header`: 20px SpaceGrotesk-SemiBold
- `subheader`: 16px SpaceGrotesk-Medium
- `body`: 14px SpaceGrotesk-Regular
- `label`: 12px SpaceGrotesk-Medium (uppercase, tracked)
- `caption`: 10px SpaceGrotesk-Regular
- `mono/monoSmall/monoBold`: JetBrains Mono (14/12/14px)

---

## Navigation Architecture

```
Pre-App (no tab bar):
  Landing → Onboarding Welcome → Onboarding Setup → [OS permissions] → Landing (returning)

Main App (4-tab bottom nav via VoidTabBar):
  Tab 1: CHAT       → ChatSelectionScreen → ChatScreen (push)
  Tab 2: WALLET     → WalletScreen [Balance|History] → Send (push) / Receive (push) / Wallet Settings (push) / Success (push)
  Tab 3: MESH       → MeshZoneScreen → Peer Detail (push)
  Tab 4: PROFILE    → ProfileScreen → Settings (push)
```

### Route Structure
```
app/
├── (tabs)/                    ← Tab screens (show tab bar)
│   ├── _layout.tsx            ← Tabs with VoidTabBar
│   ├── index.tsx              ← Entry redirect logic
│   ├── chat.tsx               ← ChatSelectionScreen
│   ├── wallet.tsx             ← WalletScreen
│   ├── mesh.tsx               ← MeshZoneScreen
│   └── profile.tsx            ← ProfileScreen
├── chat/                      ← Push screens (hide tab bar)
│   ├── selection.tsx
│   └── thread.tsx             ← ChatScreen
├── wallet/
│   ├── send.tsx               ← SendScreen
│   ├── receive.tsx            ← ReceiveScreen (NEW)
│   ├── success.tsx            ← TransactionSuccessScreen (NEW)
│   ├── settings.tsx           ← WalletSettingsScreen
│   └── [seed recovery screens intentionally hidden]
├── onboarding/
│   ├── _layout.tsx            ← Stack with fade transitions
│   ├── index.tsx              ← OnboardingWelcomeScreen
│   └── setup.tsx              ← OnboardingSetupScreen
├── landing.tsx
└── _layout.tsx                ← Root: font loading, splash, providers
```

---

## Completed Phases

### Phase 1: Foundation Layer ✓
| File | Status |
|------|--------|
| `constants/void-protocol.ts` | Created — all design tokens |
| `assets/fonts/` | JetBrains Mono (3 weights) + Space Grotesk (5 weights) |
| `app/_layout.tsx` | Modified — global font loading via `useFonts()`, splash screen |
| `components/ui/VoidScreen.tsx` | Created — SafeAreaView + void background |
| `components/ui/VoidCard.tsx` | Created — surface card with ghost border |
| `components/ui/VoidText.tsx` | Created — typography component |
| `components/ui/VoidButton.tsx` | Created — primary/outline/ghost CTA |

### Phase 2: Navigation Overhaul ✓
| File | Status |
|------|--------|
| `app/(tabs)/_layout.tsx` | Created — Expo Router Tabs |
| `components/ui/VoidTabBar.tsx` | Created — custom 4-tab bar |
| `app/(tabs)/chat.tsx` | Created — wraps ChatSelectionScreen |
| `app/(tabs)/wallet.tsx` | Created — wraps WalletScreen |
| `app/(tabs)/mesh.tsx` | Created — wraps MeshZoneScreen |
| `app/(tabs)/profile.tsx` | Created — wraps ProfileScreen |

**BottomNavWithMenu** removed from: ChatSelectionScreen, WalletScreen, ProfileScreen, HistoryScreen, MeshZoneScreen, EditNicknameModal. Old files (`BottomNavWithMenu.tsx`, `MainMenuModal.tsx`) still exist but are unused — safe to delete.

### Phase 3A: Onboarding Flow ✓
| File | Status |
|------|--------|
| `components/screens/IndexScreen.tsx` | Rewritten — VP landing with mesh gradients |
| `components/screens/OnboardingWelcomeScreen.tsx` | NEW — step 1/2, feature highlights |
| `components/screens/OnboardingSetupScreen.tsx` | NEW — step 2/2, wallet creation logic |
| `app/onboarding/_layout.tsx` | NEW — stack with fade transitions |
| `app/onboarding/index.tsx` | NEW — wraps Welcome |
| `app/onboarding/setup.tsx` | NEW — wraps Setup |

All wallet creation logic (MWA, LocalWallet, IdentityManager, SecureStore) preserved from original `OnboardingScreen.tsx`.

### Phase 3B: Chat Flow ✓
| File | Status |
|------|--------|
| `components/screens/ChatSelectionScreen.tsx` | Restyled — VoidScreen, VP tokens, router.push |
| `components/screens/ChatScreen.tsx` | Restyled — VP.colors.void background |
| `components/chat/ChatHeader.tsx` | 12 hardcoded colors → VP tokens |
| `components/chat/ChatInput.tsx` | 10 hardcoded colors → VP tokens |
| `components/chat/ChatMessages.tsx` | 10 hardcoded colors → VP tokens |

All business logic (mesh chat, payment commands, peer selection) untouched.

### Phase 3C: Wallet Flow ✓
| File | Status |
|------|--------|
| `components/screens/nostr/wallet/WalletScreen.tsx` | **Complete rewrite** — `[Balance\|History]` segmented control, merged HistoryScreen, VoidScreen wrapper, VP tokens everywhere |
| `components/screens/nostr/wallet/SendScreen.tsx` | **Restyled** — VoidScreen, VP tokens (zero hardcoded colors), solid cyan send CTA |
| `components/screens/nostr/wallet/ReceiveScreen.tsx` | **NEW** — QR code, stealth badge, copy/share, mesh peer count |
| `components/screens/nostr/wallet/TransactionSuccessScreen.tsx` | **NEW** — success page with details card, explorer/share actions |
| `app/wallet/receive.tsx` | NEW — route wrapper |
| `app/wallet/success.tsx` | NEW — route wrapper |
| `app/wallet/send.tsx` | Simplified — removed hardcoded background wrapper |

**Deviations from original plan:**
- Swap button removed entirely (plan said keep as "Coming Soon", but Stitch designs don't include it)
- Network badge removed from Wallet (Stitch uses sync status in History tab instead)
- Send button changed from outline to solid cyan (matches Stitch "Send Payment Refined")
- TransactionSuccessScreen uses URL search params instead of navigation state (more robust for Expo Router)
- ReceiveScreen pulls mesh peer count from useMeshChat for the info card

---

## Remaining Work

### Phase 3D: Mesh Flow COMPLETE
| File | Status |
|------|--------|
| `components/screens/MeshZoneScreen.tsx` | **Complete rewrite** — VoidScreen, VP tokens, BLE status badge, scanning indicator, active node cards with VoidCard, zone selection, custom zones |
| `components/screens/PeerDetailScreen.tsx` | **NEW** — Profile section, wallet address copy, connection details (BLE/signal/encryption), mesh routing info, Message/Payment CTAs, Block peer |
| `app/mesh/[peerId].tsx` | **NEW** — route wrapper for peer detail push screen |
| `app/_layout.tsx` | Added `mesh` Stack.Screen for push navigation |

**Stitch references used**: "Anonmesh Mesh Zone Branded v3" (`330935ec`), "Peer Detail: phantom_node_7" (`16977199`)

**Changes from original plan**:
- MeshZoneScreen now shows real connected peers from `useMeshChat` (not just zone selection)
- Peer cards show initials avatar, verified/unverified shield, connection type, signal strength, truncated address
- PeerDetailScreen uses `expo-clipboard` for address copy (same pattern as ReceiveScreen)
- Mesh routing section shows static values (hop count, relay capability, protocol) since the BLE mesh lib doesn't expose routing metadata yet

### Phase 3E: Profile Flow COMPLETE
| File | Status |
|------|--------|
| `components/screens/ProfileScreen.tsx` | **Complete rewrite** — VoidScreen, identity card with avatar/BLE status, public identity (Solana address + Mesh Node ID with copy), node stats cards, settings gear navigation, wallet management entrypoint |
| `components/screens/SettingsScreen.tsx` | **NEW** — Full push screen replacing SettingsModal. Sections: Privacy, Mesh Network, Wallet, About. Wallet section routes to existing wallet settings instead of unreleased recovery features |
| `app/settings.tsx` | **NEW** — route wrapper |
| `app/_layout.tsx` | Added `settings` Stack.Screen |

**Stitch references used**: "Anonmesh Profile Branded v5" (`31d6c2b7`), "Anonmesh Settings Refined" (`e4bedc72`)

**Changes from original plan**:
- SettingsModal (class component, PanResponder bottom sheet) replaced entirely with SettingsScreen (functional component, full push screen). Old SettingsModal still exists as dead code — safe to delete in Phase 5.
- ProfileScreen now uses `useMeshChat` for live BLE status and connected peer count (original had no mesh integration)
- ProfileScreen uses `expo-clipboard` for address copy (consistent with ReceiveScreen, PeerDetailScreen)
- Inline nickname editing with save button replaces the old always-visible TextInput + header Save button
- Old custom icon components (OctagonTimesIcon, SeedlingIcon) replaced with Phosphor icons (Warning, Key)
- Settings toggles are local state only — would persist via SecureStore in production (noted in code)
- Export seed phrase / import seed / destroy keys actions were removed from the exposed UI because they were not backed by current app functionality

### Deferred / Hidden Surfaces

- The Stitch seed phrase backup/import mockups are intentionally not exposed in the live route tree for this pass
- Recovery/export flows can come back later once they are backed by real wallet functionality instead of placeholder logic
- The redesign scope is now explicitly "current product behavior first, roadmap screens later"

### Phase 4: UX Polish (partial — woven into screen conversions)
- NumericKeyboard restyled to VP tokens (was using LinearGradient)
- WalletSettingsScreen restyled to VP tokens (was using LinearGradient + hardcoded colors)
- Empty states added to: Messages list, Mesh Zone (no nodes), Wallet Settings (no offline wallets)
- Remaining polish items (animations, skeleton loaders, haptics) are runtime/device-dependent — best done during on-device testing

### Phase 5: Cleanup COMPLETE

**Deleted files (all verified as dead code / unreferenced):**
- `components/ui/BottomNavWithMenu.tsx` — replaced by VoidTabBar
- `components/modals/MainMenuModal.tsx` + `.example.tsx` — replaced by tab nav
- `components/modals/SettingsModal.tsx` — replaced by SettingsScreen
- `components/modals/DepositOfflineModal.tsx` — unused, not imported anywhere
- `components/screens/OnboardingScreen.tsx` — replaced by OnboardingWelcomeScreen + OnboardingSetupScreen
- `components/screens/HistoryScreen.tsx` — merged into WalletScreen History tab
- `components/screens/nostr/wallet/SwapScreen.tsx` — swap feature removed from redesign
- `app/wallet/swap.tsx` — dead route
- `app/wallet/history.tsx` — dead route (history merged into wallet tab)
- `components/screens/nostr/wallet/SeedPhraseBackupScreen.tsx` — removed from active app surface
- `components/screens/nostr/wallet/SeedPhraseImportScreen.tsx` — removed from active app surface
- `app/wallet/seed-backup.tsx` — removed
- `app/wallet/seed-import.tsx` — removed

**Remaining files with LinearGradient (modals, not main screens):**
- `components/modals/EditNicknameModal.tsx` — used by ChatScreen
- `components/modals/PaymentRequestModal.tsx` — used by ChatScreen
- `components/modals/CreateOfflineAddressModal.tsx` — used by WalletSettingsScreen
- `components/modals/SendConfirmationModal.tsx` — used by SendScreen
- `components/screens/CustomMeshZoneScreen.tsx` — used by app/zone/create.tsx
These modals are secondary UI and can be converted in a future polish pass.

**Additional cleanup (from audit agents):**
- `app/profile.tsx` — removed orphaned navigation callback props (ProfileScreen no longer accepts props)
- `app/zone/index.tsx` — removed orphaned navigation callback props (MeshZoneScreen no longer accepts props)
- `app/_layout.tsx` — removed `ble-test` Stack.Screen (no corresponding route file existed)
- `components/chat/PeerListItem.tsx` — deleted (not imported anywhere, dead code)

**Verification done:**
- Zero broken imports after deletion (grep confirmed)
- All active screen components use VP tokens (zero hardcoded hex colors in 21 files)
- All push routes verified to have corresponding route files
- Root layout Stack.Screen entries match real route files, avoiding Expo Router export warnings
- `npx tsc --noEmit` passes
- `npm run lint` passes with warnings only
- `CI=1 npx expo export --platform web` succeeds and writes `dist/`

---

## Files That Still Need VP Conversion

Files with LinearGradient remaining (modals only — all main screens are converted):
- `components/modals/EditNicknameModal.tsx` — secondary, used by ChatScreen
- `components/modals/PaymentRequestModal.tsx` — secondary, used by ChatScreen
- `components/modals/CreateOfflineAddressModal.tsx` — secondary, used by WalletSettingsScreen
- `components/modals/SendConfirmationModal.tsx` — secondary, used by SendScreen
- `components/screens/CustomMeshZoneScreen.tsx` — secondary, used by zone/create route

## Conversion Pattern (for remaining screens)

When converting a screen to VP:
1. Replace `LinearGradient` wrapper with `<VoidScreen>`
2. Remove `SafeAreaView` import (VoidScreen handles it)
3. Remove `expo-linear-gradient` import
4. Import `VP` from `@/constants/void-protocol`
5. Replace ALL hardcoded hex colors with VP tokens
6. Replace font weights/sizes with VP.typography spreads
7. Use VoidCard for card surfaces
8. Verify zero hardcoded colors remain: `grep -n '"#' <file>`
9. Preserve all business logic untouched
10. Update this CONTEXT.md with what changed

---

## Reference: Full Plan

The detailed implementation plan with UX considerations, verification checklists, and Phase 4-5 specs lives at:
`~/.claude/plans/mossy-popping-quokka.md`
