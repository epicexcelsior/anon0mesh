# AnonMesh UI Redesign — Implementation Plan

## Context

AnonMesh is a privacy-focused mesh networking + Solana wallet mobile app built with Expo/React Native. The current UI was built iteratively during development — hardcoded colors, no design system, a custom swipe-up modal menu instead of proper tab navigation, and inconsistent styling across screens. We've designed a complete set of screens in Google Stitch following a "Void Protocol" design system. This plan converts the existing app to match those designs while preserving all existing functionality (BLE mesh, wallet, chat).

**Branch**: `feature/ui-redesign` (off `v2`)  
**Target**: Android AMOLED ~360x800dp (Seeker device)

---

## Phase 0: Pre-Flight (Before Writing Code)

### 0.1 — Confirm Canonical Stitch Screens
> **ACTION NEEDED**: User must confirm which Stitch screen version is the "final" for each screen type. There are multiple versions (e.g., 3 different Landing screens, 2 Messages, 2 Wallets, etc.)

Proposed mapping (user to confirm):
| Screen | Proposed Final Stitch Screen |
|--------|------------------------------|
| Landing | "Anonmesh Landing Immersive Refined" (e7b6e13d) |
| Onboarding Welcome | "Onboarding: Welcome Centered Refined v2" (007d8b29) |
| Onboarding Setup | "Anonmesh Onboarding Setup" (c66bfa9b) |
| Messages (Chat List) | "Anonmesh Messages Branded Final" (80442460) |
| Chat Conversation | "Anonmesh Chat Refined Readability" (c07cb245) |
| Wallet | "Wallet Dashboard" (5ffc9f80) |
| History | "Anonmesh History Branded v2" (e6f92ec6) |
| Send Payment | "Anonmesh Send Payment Refined" (73c0fe68) |
| Receive Payment | "Receive Payment" (adf60cb5) |
| Transaction Success | "Transaction Success" (715fb336) |
| Mesh Constellation | "Anonmesh Mesh Constellation Branded" (b131d61e) |
| Peer Detail | "Peer Detail: phantom_node_7" (16977199) |
| Profile | "Anonmesh Profile Branded v5" (31d6c2b7) |
| Settings | "Anonmesh Settings Refined" (e4bedc72) |
| Seed Phrase Backup | "Seed Phrase Backup" (e4abfeb1) |
| Seed Phrase Import | "Seed Phrase Import" (9713a5c9) |
| New Chat/Select Peer | "New Chat Select Peer" (0a463364) |

### 0.2 — Download Stitch HTML References
- Fetch HTML from each canonical screen via `mcp__stitch__get_screen`
- Save to `design/stitch-html/` as reference (e.g., `landing.html`, `messages.html`)
- These become the pixel-accurate spec for each screen

---

## Phase 1: Foundation Layer (No Visual Changes Yet)

**Goal**: Build the design system infrastructure so screens can migrate incrementally without a big-bang rewrite.

### 1.1 — Create Void Protocol Theme File
**New file**: `constants/void-protocol.ts`

```ts
export const VP = {
  colors: {
    void: '#050A0A',           // root background everywhere
    surface: '#0a1214',        // card backgrounds
    ghostBorder: 'rgba(255,255,255,0.05)',
    text: {
      primary: '#dee4e3',      // NOT pure white
      secondary: '#8a9a9a',    // muted
      disabled: '#4a5555',
    },
    accent: {
      cyan: '#22D3EE',         // interactive elements
      cyanMuted: 'rgba(34,211,238,0.15)',
      purple: '#8B5CF6',       // stealth/privacy ONLY
      purpleMuted: 'rgba(139,92,246,0.15)',
    },
    status: {
      success: '#22D3EE',
      error: '#EF4444',
      warning: '#F59E0B',
    },
  },
  typography: {
    pageTitle: { fontSize: 28, fontFamily: 'SpaceGrotesk-Bold' },
    header: { fontSize: 20, fontFamily: 'SpaceGrotesk-SemiBold' },
    body: { fontSize: 14, fontFamily: 'SpaceGrotesk-Regular' },
    label: { fontSize: 12, fontFamily: 'SpaceGrotesk-Medium' },
    caption: { fontSize: 10, fontFamily: 'SpaceGrotesk-Regular' },
    mono: { fontSize: 14, fontFamily: 'JetBrainsMono-Regular' },
    monoSmall: { fontSize: 12, fontFamily: 'JetBrainsMono-Regular' },
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 8, md: 12, lg: 16, xl: 24 },
} as const;
```

### 1.2 — Add JetBrains Mono Font
- Download JetBrains Mono (Regular, Medium, Bold) to `assets/fonts/`
- Register in font loading (either global in `_layout.tsx` or via `expo-font`)
- Space Grotesk already exists in `components/fonts/Space_Grotesk/`

### 1.3 — Global Font Loading
- Move font loading to `_layout.tsx` using `useFonts()` from expo-font
- Load ALL weights of Space Grotesk + JetBrains Mono at app startup
- Show splash screen until fonts are ready

### 1.4 — Create Shared UI Primitives
**New file**: `components/ui/VoidCard.tsx` — standard card with ghost border  
**New file**: `components/ui/VoidText.tsx` — text component using VP typography  
**New file**: `components/ui/VoidButton.tsx` — standard CTA button  
**New file**: `components/ui/VoidScreen.tsx` — screen wrapper (SafeAreaView + VP.colors.void background)

These are thin wrappers, not an abstraction layer. They enforce the design system.

### 1.5 — Icon System Decision
**DECIDED**: Keep `phosphor-react-native`. No icon migration.
Phosphor has excellent RN support, outlined style matches design intent, and the visual difference at 24px is negligible.

### Verification
- [ ] App still builds and runs identically
- [ ] New theme file importable from any component
- [ ] All fonts load (check with a temporary test Text element)
- [ ] No existing screens affected

---

## Phase 2: Navigation Overhaul

**Goal**: Replace the custom swipe-up modal menu with a proper 4-tab bottom navigator.

### 2.1 — Create Tab Layout
**New file**: `app/(tabs)/_layout.tsx`

```
app/(tabs)/
├── _layout.tsx         ← NEW: BottomTabNavigator (Chat, Wallet, Mesh, Profile)
├── index.tsx           ← Keep: entry logic router (redirects to chat tab)
├── chat.tsx            ← NEW: wraps ChatSelectionScreen (messages list)
├── wallet.tsx          ← NEW: wraps WalletScreen
├── mesh.tsx            ← NEW: wraps MeshConstellationScreen
├── profile.tsx         ← NEW: wraps ProfileScreen
```

The tab layout uses `@react-navigation/bottom-tabs` (already in package.json) with a custom tab bar component styled to Void Protocol.

### 2.2 — Custom Tab Bar Component
**New file**: `components/ui/VoidTabBar.tsx`

- 4 tabs: Chat, Wallet, Mesh, Profile
- Phosphor icons: ChatCircle, Wallet, Graph/Broadcast, User
- Active state: #22D3EE icon + label
- Inactive: #4a5555 
- Background: #050A0A with top ghost border
- No labels (icon-only) OR small 10px labels — match Stitch design

### 2.3 — Reroute Stack Screens
Screens that push ON TOP of tabs (not tab switches):
```
app/
├── (tabs)/             ← Tab screens (always show tab bar)
├── chat/
│   └── [peerId].tsx    ← Chat conversation (push, hides tab bar)
├── wallet/
│   ├── send.tsx        ← Send payment (push)
│   ├── receive.tsx     ← NEW: Receive payment (push)
│   ├── transaction.tsx ← NEW: Transaction confirmation (push)
│   └── history.tsx     ← REMOVE: History is now a segment inside Wallet tab
├── mesh/
│   └── [peerId].tsx    ← NEW: Peer detail (push)
├── settings.tsx        ← NEW: Settings (push from Profile)
├── onboarding/
│   ├── index.tsx       ← Welcome screen (no tab bar)
│   └── setup.tsx       ← Setup screen (no tab bar)
├── landing.tsx         ← Landing (no tab bar)
```

### 2.4 — Remove Old Navigation Components
- Delete or deprecate `components/ui/BottomNavWithMenu.tsx`
- Delete or deprecate `components/modals/MainMenuModal.tsx`
- Remove all `onNavigateToX` callback props threaded through screens
- Remove `BottomNavWithMenu` usage from every screen that includes it

### 2.5 — Update Entry Flow
Current: `(tabs)/index.tsx` → checks identity → redirects
New: Same logic, but redirects within the tab structure:
- No identity → `/onboarding`
- Has identity, first time → `/landing`
- Returning → `/(tabs)/chat` (default tab)

### Verification
- [ ] 4 tabs visible on main screens
- [ ] Tab switching works (Chat, Wallet, Mesh, Profile)
- [ ] Push screens (chat conversation, send, etc.) hide tab bar
- [ ] Pre-app screens (landing, onboarding) have NO tab bar
- [ ] All existing navigation flows still work
- [ ] Back button behavior correct on pushed screens

---

## Phase 3: Screen Conversions (Flow by Flow)

**Strategy**: Convert one flow at a time, starting with the most-used screens. Each conversion:
1. Fetch Stitch HTML as reference
2. Rewrite the screen component using VP design tokens
3. Preserve all business logic and hooks
4. Test the screen in isolation

### 3A — Onboarding Flow (3 screens)
**Priority**: HIGH (first thing every new user sees)

| Screen | Current File | Action |
|--------|-------------|--------|
| Landing | `components/screens/IndexScreen.tsx` | Rewrite to match Stitch landing |
| Onboarding Welcome | `components/screens/OnboardingScreen.tsx` | Split into Welcome + Setup |
| Onboarding Setup | (new) | Extract setup logic from OnboardingScreen |

**Key changes**:
- Landing: Remove feature cards bottom sheet, replace with immersive mesh canvas + single "ENTER THE MESH" CTA
- Welcome: Clean "Private by Default" headline, 3 feature highlights, "GET STARTED" CTA
- Setup: Display name + mesh alias, permission primer (informational), wallet create/import, "ENTER THE MESH" triggers OS dialogs

**UX considerations**:
- Permission priming screen: Explain WHY each permission is needed before OS dialog fires
- Smooth transitions between onboarding steps (shared element transitions or fade)
- Loading states during wallet creation (skeleton or animated indicator)

### 3B — Chat Flow (3 screens)
**Priority**: HIGH (primary use case, default tab)

| Screen | Current File | Action |
|--------|-------------|--------|
| Messages List | `components/screens/ChatSelectionScreen.tsx` | Restyle to match Stitch messages |
| Chat Conversation | `components/screens/ChatScreen.tsx` | Restyle chat bubbles, header |
| New Chat/Select Peer | (reuse ChatSelection) | May be same screen with filter |

**Key changes**:
- Messages list: Peer avatars (generated/placeholder), last message preview, unread indicators, encryption lock icons
- Chat conversation: Proper message bubbles (sent right, received left), timestamps with lock icons, clean input bar
- Remove ChatSidebar (replaced by Messages list tab)

**UX considerations**:
- Pull-to-refresh on messages list
- Swipe actions on conversations (delete, pin, mute)
- Typing indicators
- Message grouping by time
- Haptic feedback on send

### 3C — Wallet Flow (5 screens)
**Priority**: HIGH (core feature)

| Screen | Current File | Action |
|--------|-------------|--------|
| Wallet (Balance) | `components/nostr/wallet/WalletScreen.tsx` | Rewrite with segmented control |
| Wallet (History) | `components/screens/HistoryScreen.tsx` | Integrate as segment, not separate screen |
| Send Payment | `components/nostr/wallet/SendScreen.tsx` | Restyle to match Stitch |
| Receive Payment | NEW | QR code + address + copy/share |
| Transaction Confirmation | NEW | Success state after send |

**Key changes**:
- Wallet: Add [Balance | History] segmented control at top
- History becomes a tab/segment within Wallet, NOT a separate route
- Send: Clean amount keypad, recipient input, fee details
- Receive: NEW screen with QR, copy, share
- Tx Confirmation: NEW success screen with checkmark animation

**UX considerations**:
- Balance should show SOL + USD conversion
- Segmented control should feel native (animated underline)
- Send flow: clear progressive disclosure (recipient → amount → confirm)
- Haptic feedback on transaction confirmation
- Pull-to-refresh on balance

### 3D — Mesh Flow (2 screens)
**Priority**: MEDIUM
**DECIDED**: Keep zone system, restyle to Void Protocol. Constellation visualization deferred to future iteration. Ship a styled peer list as the Mesh tab for now.

| Screen | Current File | Action |
|--------|-------------|--------|
| Mesh Zones | `components/screens/MeshZoneScreen.tsx` | Restyle to Void Protocol |
| Peer Detail | NEW | Connection stats, actions (from Stitch design) |

**Key changes**:
- Restyle existing zone selection to VP colors/typography
- Add peer list below zones (styled cards showing connected peers)
- Peer Detail: Push screen with connection type, distance, latency, encryption status, Send Message/Payment actions

**UX considerations**:
- Zone selection should feel clean and purposeful
- Peer list cards should show connection quality indicators
- Peer Detail should have clear CTAs for message/payment

### 3E — Profile Flow (2 screens)
**Priority**: MEDIUM

| Screen | Current File | Action |
|--------|-------------|--------|
| Profile | `components/screens/ProfileScreen.tsx` | Restyle to match Stitch |
| Settings | `components/modals/SettingsModal.tsx` | Convert from modal to full screen |

**Key changes**:
- Profile: User identity card, node stats, mesh activity summary, settings access button
- Settings: Convert from bottom sheet modal to full push screen with sections (Privacy, Mesh Config, Wallet, About)

### 3F — Supplementary Screens
**Priority**: LOW (build after core flows work)

| Screen | Action |
|--------|--------|
| Seed Phrase Backup | NEW — shown after wallet creation |
| Seed Phrase Import | NEW — accessible from onboarding |
| QR Scanner | Restyle existing modal |
| Edit Profile | Form screen, follows Settings pattern |

---

## Phase 4: UX Polish & Audit

### 4.1 — Animation & Transitions
- Screen transitions: Slide from right for push, fade for tab switches
- Tab bar: Animated icon transitions (scale on select)
- Loading states: Skeleton screens instead of spinners
- Pull-to-refresh: Custom refresh indicator matching VP
- Button press: Scale down + haptic feedback

### 4.2 — Empty States
Every list screen needs an empty state:
- Messages: "No conversations yet — peers will appear when nearby"
- Wallet History: "No transactions yet"
- Mesh Constellation: "Searching for peers..." with animated radar
- Each should have an illustration + explanatory text + optional CTA

### 4.3 — Error States
- Network errors: Inline banner (not alert)
- Transaction failures: Clear error message + retry option
- BLE disconnection: Persistent top banner showing connection status
- Permission denied: Explanation + "Open Settings" CTA

### 4.4 — Touch & Interaction Audit
- All touch targets minimum 44x44dp
- Scrollable areas have proper scroll indicators
- Text inputs have proper keyboard handling (KeyboardAvoidingView)
- Long text truncates with ellipsis, not wrapping
- Pressable elements have visual feedback (opacity or scale)

### 4.5 — Accessibility
- All images have accessible labels
- Color contrast meets WCAG AA (our palette should pass on AMOLED)
- Screen reader navigation order is logical
- Font sizes respect system accessibility settings

---

## Phase 5: Integration Testing & QA

### 5.1 — Flow-by-Flow Testing
- [ ] Fresh install: Landing → Onboarding → Main app
- [ ] Returning user: Direct to Messages tab
- [ ] Send payment: Wallet → Send → Confirmation → Back to Wallet
- [ ] Receive payment: Wallet → Receive → Copy/Share → Back
- [ ] Chat: Messages list → Select peer → Chat → Send message → Back
- [ ] Mesh: Constellation → Tap peer → Peer detail → Send message
- [ ] Profile: Profile → Settings → Toggle options → Back
- [ ] BLE: Connect to real peer, exchange messages
- [ ] Wallet: Create wallet, check balance, view history

### 5.2 — Visual Consistency Check
- [ ] Every screen uses VP.colors.void background
- [ ] No pure white (#FFFFFF) text — all #dee4e3
- [ ] No gradient backgrounds (single #050A0A)
- [ ] Consistent 4-tab nav on all main screens
- [ ] No old navigation components (BottomNavWithMenu, MainMenuModal)
- [ ] JetBrains Mono used for all technical data (addresses, hashes, balances)
- [ ] Space Grotesk for all UI text

---

## Execution Order & Estimates

| Phase | Description | Risk |
|-------|-------------|------|
| **1** | Foundation (theme, fonts, primitives) | LOW — additive only |
| **2** | Navigation overhaul | HIGH — touches every screen |
| **3A** | Onboarding flow | MEDIUM — isolated from main app |
| **3B** | Chat flow | HIGH — most complex screen |
| **3C** | Wallet flow | HIGH — financial, must be correct |
| **3D** | Mesh flow | LOW — restyle only, constellation deferred |
| **3E** | Profile flow | LOW — straightforward |
| **3F** | Supplementary | LOW — additive |
| **4** | UX polish | LOW — incremental |
| **5** | Testing | N/A |

**Recommended approach**: Complete Phase 1 + 2 together (foundation + nav) as one unit, then convert screens in order 3A → 3B → 3C → 3D → 3E → 3F with UX polish (Phase 4) woven into each screen conversion rather than deferred to the end.

---

## Critical Files to Modify

| File | Phase | Change |
|------|-------|--------|
| `constants/void-protocol.ts` | 1 | NEW — design tokens |
| `app/_layout.tsx` | 1, 2 | Font loading, navigation restructure |
| `app/(tabs)/_layout.tsx` | 2 | NEW — tab navigator |
| `components/ui/VoidTabBar.tsx` | 2 | NEW — custom tab bar |
| `components/ui/VoidCard.tsx` | 1 | NEW — card primitive |
| `components/ui/VoidText.tsx` | 1 | NEW — text primitive |
| `components/ui/VoidScreen.tsx` | 1 | NEW — screen wrapper |
| `components/ui/BottomNavWithMenu.tsx` | 2 | DELETE |
| `components/modals/MainMenuModal.tsx` | 2 | DELETE |
| `components/screens/IndexScreen.tsx` | 3A | Rewrite (Landing) |
| `components/screens/OnboardingScreen.tsx` | 3A | Split into Welcome + Setup |
| `components/screens/ChatSelectionScreen.tsx` | 3B | Restyle (Messages list) |
| `components/screens/ChatScreen.tsx` | 3B | Restyle (Chat conversation) |
| `components/nostr/wallet/WalletScreen.tsx` | 3C | Rewrite (Wallet with segments) |
| `components/screens/HistoryScreen.tsx` | 3C | Merge into Wallet |
| `components/nostr/wallet/SendScreen.tsx` | 3C | Restyle |
| `components/screens/MeshZoneScreen.tsx` | 3D | Rewrite (Constellation) |
| `components/screens/ProfileScreen.tsx` | 3E | Restyle |
| `components/modals/SettingsModal.tsx` | 3E | Convert to full screen |

---

## Decisions Made

- **Icon library**: Keep Phosphor. No migration.
- **Mesh tab**: Keep zone system, restyle to Void Protocol. Constellation deferred.
- **Constellation complexity**: Static placeholder / styled peer list for now.
- **Swap feature**: REMOVED entirely (deviated from plan — Stitch designs don't include it).
- **Canonical Stitch screens**: User confirmed — currently favorited screens in Stitch project are canonical.
- **Wallet History**: User confirmed — `[Balance|History]` segmented control inside Wallet tab, NOT a separate route.

## Remaining Questions for User

All original questions resolved.

---

## Execution Log & Deviations

### Deviations from Original Plan

1. **Swap button removed** — Plan said "Keep as Coming Soon." Stitch designs don't include it, so it was removed from the new WalletScreen entirely. Old `SwapScreen.tsx` and `app/wallet/swap.tsx` still exist but are unused.

2. **Network badge removed from Wallet** — Original had a "Solana Network" badge. Stitch design uses sync status in History tab instead. SolanaIcon import removed.

3. **Send button styling** — Plan didn't specify. Changed from outline (border+transparent) to solid cyan CTA to match Stitch "Send Payment Refined" design.

4. **TransactionSuccessScreen uses URL params** — Plan implied navigation state. Implementation uses `useLocalSearchParams` which is more robust with Expo Router deep linking.

5. **SendConfirmationModal not yet removed** — Still exists and is used in SendScreen. The new TransactionSuccessScreen is a separate full-screen route. These may coexist (modal for BLE confirmations, full screen for online success) or the modal should be replaced in a future pass.

6. **History route not yet deleted** — `app/wallet/history.tsx` still exists. History is now fully merged into WalletScreen's History tab. The old route should be removed in Phase 5 cleanup.

7. **Onboarding was split into 2 steps** — Plan said "split into Welcome + Setup." Implementation did this but the original `OnboardingScreen.tsx` may still exist as dead code. Needs cleanup.

8. **Old nav files not deleted** — `BottomNavWithMenu.tsx` and `MainMenuModal.tsx` still exist but are unused. Safe to delete in Phase 5.

### Phase Completion Status (as of 2026-04-03)

| Phase | Status | Notes |
|-------|--------|-------|
| 0 | DONE | Stitch screens confirmed, screen mapping documented |
| 1 | DONE | VP tokens, fonts, UI primitives |
| 2 | DONE | 4-tab nav, VoidTabBar, old nav removed from screens |
| 3A | DONE | Landing, Onboarding Welcome, Onboarding Setup |
| 3B | DONE | ChatSelection, ChatScreen, ChatHeader/Input/Messages |
| 3C | DONE | WalletScreen (Balance+History), SendScreen, ReceiveScreen (NEW), TransactionSuccessScreen (NEW) |
| 3D | DONE | MeshZoneScreen rewrite + PeerDetailScreen (NEW) + app/mesh route |
| 3E | DONE | ProfileScreen rewrite + SettingsScreen (NEW, replacing modal) + app/settings route |
| 3F | DONE | SeedPhraseBackupScreen + SeedPhraseImportScreen (NEW) + routes |
| 4 | DONE | NumericKeyboard + WalletSettingsScreen VP restyle, empty states |
| 5 | DONE | 10 dead files deleted, zero broken imports, all routes verified |

### Phase 3D-F + Phase 4-5 (2026-04-04)

**Phase 3D (Mesh):**
- `MeshZoneScreen.tsx` — complete rewrite with VoidScreen, VP tokens, BLE status badge, scanning indicator, active node cards from useMeshChat, zone selection preserved
- `PeerDetailScreen.tsx` — NEW push screen: profile section, wallet address copy, connection details, mesh routing, Message/Payment CTAs, block peer
- `app/mesh/[peerId].tsx` — NEW route, `mesh` added to root Stack

**Phase 3E (Profile):**
- `ProfileScreen.tsx` — complete rewrite: identity card with avatar/BLE status, public identity (Solana + Mesh ID with copy), node stats, security section, settings gear nav. Now uses useMeshChat.
- `SettingsScreen.tsx` — NEW full push screen replacing class-component SettingsModal. Sections: Privacy, Mesh Network, Wallet, About. All toggles use Switch.
- `app/settings.tsx` — NEW route

**Phase 3F (Supplementary):**
- `SeedPhraseBackupScreen.tsx` — NEW: warning, tap-to-reveal word list, copy, confirmation checkbox, Continue CTA
- `SeedPhraseImportScreen.tsx` — NEW: 12/24 toggle, numbered inputs with auto-advance, clipboard paste, Restore CTA
- Routes: `app/wallet/seed-backup.tsx`, `app/wallet/seed-import.tsx`

**Phase 4 (Polish):**
- `NumericKeyboard.tsx` — removed LinearGradient, VP tokens, no hardcoded colors
- `WalletSettingsScreen.tsx` — removed LinearGradient + SafeAreaView, VP tokens, VoidScreen/VoidCard

**Phase 5 (Cleanup):**
- 10 dead files deleted: BottomNavWithMenu, MainMenuModal (x2), SettingsModal, DepositOfflineModal, OnboardingScreen, HistoryScreen, SwapScreen, swap.tsx route, history.tsx route
- Zero broken imports verified via grep
- All screen components verified zero hardcoded hex colors
- 5 modals still use LinearGradient (secondary UI, future polish)

### No Commits Yet
All UI redesign work is unstaged. No commits have been made. Ready to commit.
