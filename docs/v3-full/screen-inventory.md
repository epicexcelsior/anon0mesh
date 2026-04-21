# screen-inventory.md — v3-full surface map

Every surface in scope. Each row: where it lives, what it contains, which source artifact contributes what, known blockers.

Recovery note: `Source — design` now means **visual owner**. Current `v3-full` primitives may still be the implementation base for a screen, but the visual canon is the redesign lane unless stated otherwise.

Read `decisions.md` and `architecture.md` first.

## Legend

- **Route:** expo-router path.
- **Source — design:** where the visual language comes from.
- **Source — content:** where the copy / info architecture / data structure comes from.
- **Backend:** real, stub, or fixture-only for this session.

## Pre-app

### 1. Landing

- **Route:** `app/index.tsx`
- **Purpose:** Immersive first impression. Single CTA "ENTER THE MESH". Version footer.
- **Source — design:** redesign canon (Void Protocol shell, typography, atmosphere) + wireframe's dark immersive pattern. Mesh-particle canvas + animated logo remains **polish pass**.
- **Source — content:** `design/SCREEN_MAP.md` item 1.
- **Backend:** none. Pure UI.
- **Notes:** no tab bar, no status bar chrome.

### 2. Onboarding — Welcome

- **Route:** `app/onboarding/welcome.tsx`
- **Purpose:** Step 1 of 2. "Private by default" framing. 3-4 feature highlights with icons. Two CTAs: "GET STARTED" (new user) and "I have an identity" (import path).
- **Source — design:** redesign canon, implemented through current `v3-full` primitives until Phase 2 token reconciliation lands.
- **Source — content:** Stitch Welcome (design/SCREEN_MAP.md item 2).
- **Backend:** none.
- **Truth note:** copy should sell the direction without implying the full LXMF + stealth runtime is already complete on this branch.
- **Tech drawer entry point:** small "Under the hood" link opens tech deep-dive drawer.

### 3. Onboarding — Setup

- **Route:** `app/onboarding/setup.tsx`
- **Purpose:** Step 2 of 2. Identity (display name optional, auto-generated mesh alias shown). Permission priming cards (Bluetooth, notifications — explanation only, no toggles). Wallet path picker: Create New / Connect (MWA, Android only).
- **Source — design:** redesign canon.
- **Source — content:** Stitch Setup (design/SCREEN_MAP.md item 3).
- **Backend:** real — wires into `useWallet` (create local or MWA connect). MWA path Android-only; on iOS, show only Create New.
- **CTA:** "ENTER THE MESH" fires OS permission dialogs, then creates/connects wallet, then navigates to Home.

### 4. Tech deep-dive drawer

- **Route:** `app/onboarding/tech-drawer.tsx` (modal presentation)
- **Purpose:** Optional "Under the hood" content — brief primer on LXMF, Reticulum, BLE mesh, Solana stealth. Not a tutorial, not blocking.
- **Source — design:** redesign canon sheet/drawer treatment, implemented with current `Sheet` primitive.
- **Source — content:** written during execution; short paragraphs per topic, link out to sources.
- **Backend:** none.
- **Truth note:** describe target architecture accurately, but clearly mark the live branch gaps where LXMF runtime or stealth settlement is still staged.

## Home tab

### 5. Home

- **Route:** `app/(tabs)/home.tsx`
- **Purpose:** Wallet hero + mesh status + recent activity.
- **Structure (top to bottom):**
  - Header: identity chip (top-left), QR icon (top-right)
  - Mesh status strip (persistent band): node count, iface, signal
  - Hero: balance (SOL + USD), big numerals
  - Primary actions row: **Send** / Receive / History
  - Segmented control: Balance ↔ History
  - Recent activity list (or history list if segment toggled)
- **Source — design:** redesign canon for shell, hierarchy, and emphasis, implemented through the reconciled `src/design-system/` lane on current `v3-full`.
- **Source — content:** `screen-inventory.md` contract + valid wallet/transaction seams from current `v3-full`.
- **Backend:**
  - Balance: real via `useWallet` → `SolanaTransactionService.getBalance`.
  - Recent activity: real via `useTransaction` → Solana RPC recent sigs; fallback to fixture when offline.
  - Mesh status: real via `useMesh` → BLE adapter; fixture fallback when mesh not running.

### 6. Mesh status strip (component, not a route)

- **Location:** persistent slim band at the top of every tab (below safe-area status bar, above tab content). D6 locked 2026-04-18 after Phase 0/1 review. Implementation: render inside `app/(tabs)/_layout.tsx` above the `<Slot />` / `<Stack />`, or as a fixed absolute overlay the tab screens pad around — pick the cleaner option during Phase 2 Step 2.1.
- **Content:** signal-bar icon + `N nodes` + connection state chip (`Live` / `Silent` / `Offline`). Height ≈32px, glass-soft variant, tinted to match current tab's Backdrop preset.
- **Interaction:** tap → Peers sheet.
- **Source — design:** redesign canon + wireframe mesh-status information density.
- **Backend:** real mesh data via `useMesh`; fixture fallback.
- **Item 5 cross-ref:** the bullet under Home structure that says "Mesh status strip (persistent band): node count, iface, signal" remains accurate; Home just renders the same component as every other tab.

### 7. Peers sheet

- **Route:** `app/peers/index.tsx` (presented as a sheet on top of tabs)
- **Purpose:** Full peer list. Surfaces info team lead wants without adding a tab.
- **Structure:**
  - Header: summary (node count, iface, signal).
  - Peer rows: identity chip, signal strength, last-seen, beacon-stake badge if any, per-peer actions (message, send payment).
  - Empty state: copy on mesh state (scanning, no peers found, permission denied with action).
- **Source — design:** redesign canon sheet/list treatment + wireframe peer-row information density.
- **Source — content:** v3 `components/nodes/` + wireframe nodes screen.
- **Backend:** real via `usePeers`; fixture fallback.
- **Truth note:** discovery, trust, and signal come from the live mesh seam; list copy must not imply relay routing or beacon intelligence is fully exposed yet.

### 8. Peer detail

- **Route:** `app/peers/[peerId].tsx`
- **Purpose:** Deep info on a peer — connection stats (type, latency, distance if available), mesh routing info, encryption status, beacon stake (if node is beacon), per-peer actions.
- **Source — design:** redesign canon + wireframe peer-detail.
- **Source — content:** v3 `components/nodes/`.
- **Backend:** real via `usePeers(peerId)`.
- **Truth note:** transport / signal / trust are live; deeper routing, latency-distance, and beacon-stake sections stay explicitly labeled as staged runtime notes in this branch.

### 9. Send — Recipient

- **Route:** `app/send/recipient.tsx`
- **Purpose:** Step 1 of send flow. Input recipient (address paste, QR scan, mesh peer selection).
- **Source — design:** redesign canon send flow shell.
- **Source — content:** Stitch Send Payment + current route requirements.
- **Backend:** real via the current wallet send seam. Recipient selection feeds the on-chain send path, and QR scan accepts plain wallet addresses plus `solana:` links.

### 10. Send — Amount

- **Route:** `app/send/amount.tsx`
- **Purpose:** Step 2. Amount keypad, SOL display + USD equivalent, balance check.
- **Source — design:** redesign canon.
- **Backend:** uses current balance from `useWallet`.
- **Truth note:** the USD equivalent is a local estimate for now, not a live quote feed.

### 11. Send — Review

- **Route:** `app/send/review.tsx`
- **Purpose:** Step 3. Recipient, amount, fee estimate, current route, privacy mode toggle (stealth). **SlideToConfirm** widget at bottom.
- **Source — design:** redesign canon with `SlideToConfirm` retained if it still fits. Do not add Skia; keep the no-Skia path.
- **Source — content:** Stitch send + current transaction/status contract.
- **Backend:** current screen calls wallet send directly. The rebuilt branch keeps this flow **on-chain only** for now; nearby peers can be selected as recipients, but they do not switch delivery into mesh relay yet. The stealth toggle remains **preview-only** until the full privacy path lands.

### 12. Send — Success

- **Route:** `app/send/success.tsx`
- **Purpose:** Receipt surface for the submitted transfer. Shows amount, live status, reference copy, "View on Explorer" + "Share Receipt" actions.
- **Source — design:** redesign canon success/receipt surface.
- **Backend:** displays the result from submit. Explorer only opens once a network signature exists; otherwise the screen stays truthful with a local transfer reference while settlement catches up.

### 13. Receive

- **Route:** `app/receive.tsx`
- **Purpose:** QR code of wallet address, address text (copy), share action, optional "request amount" input.
- **Source — design:** redesign canon receive surface + Stitch content needs.
- **Backend:** real via `useWallet.getAddress`.

### 14. Transaction detail

- **Route:** `app/history/[txId].tsx`
- **Purpose:** Push from history row. Mirrors Success layout with extra fields (block time, slot, fee, counterparty identity if mesh-tagged).
- **Source — design:** redesign canon + current detail-card structure where still useful.
- **Backend:** `useTransaction(txId)`.

## Messages tab

### 15. Messages list

- **Route:** `app/(tabs)/messages.tsx`
- **Purpose:** Conversation list: recent conversations, peer avatars, last message preview, unread indicators, encryption lock icons. "New" action in header.
- **Source — design:** redesign canon messages list.
- **Source — content:** v3 `components/messages/`.
- **Backend:** `useMessages.list`; current thread ordering / previews come through the fixture messaging adapter.
- **Truth note:** peer discovery feeding the picker is live, but the conversation list itself is still rendering fixture-backed thread state in this branch.

### 16. Conversation detail

- **Route:** `app/messages/[peerId].tsx`
- **Purpose:** 1-on-1 thread. Peer info header, message bubbles, timestamps with lock icons, composer bar.
- **Source — design:** redesign canon conversation detail and bubble rhythm.
- **Source — content:** v3 `components/messages/` bubble shapes.
- **Backend:** `useMessages(peerId)`; sends via MessagingService (stub when LXMF not ready — queue locally, display as `Queued on device`, then settle through the fixture adapter).
- **Truth note:** the thread shell is rebuilt, but copy and status treatment must continue to frame delivery as fixture-backed until LXMF lands.

### 17. New conversation (PeersDrawer pattern)

- **Route:** presented from Messages list header "New" button as a sheet.
- **Purpose:** Choose recipient. Recent peers + mesh peer search.
- **Source — design:** redesign canon sheet with v3 peer-picker behavior.
- **Source — content:** v3 `components/messages/PeersDrawer` pattern.
- **Backend:** `usePeers`.
- **Truth note:** picker rows come from the live peer graph, but opening a thread still drops into the current fixture-backed conversation surface.

## Settings tab

### 18. Settings home

- **Route:** `app/(tabs)/settings.tsx`
- **Purpose:** Sections for identity, network, privacy, beacon registry, wallet, about. Each section navigates to a sub-page.
- **Source — design:** redesign canon settings shell.
- **Backend:** pulls wallet identity / mode from `useWallet`, local device-label preview from Settings storage, peer count from `useMesh`, and privacy preview from `usePreferences`.
- **Truth note:** the screen is rebuilt and live, but its preview cards must still distinguish local device-label state from wallet-derived alias state.

### 19. Identity modal

- **Route:** `app/settings/identity.tsx` (modal or push)
- **Purpose:** Display name edit, mesh alias, QR code of identity, identity export.
- **Source — design:** redesign canon using current identity surface structure where valid.
- **Backend:** wallet alias / address from `useWallet`, plus local device-label persistence on this device.
- **Truth note:** the editable label is a local device label for now; broader identity propagation remains staged, so wallet alias still stays key-derived elsewhere on the branch.

### 20. Wallet export modal

- **Route:** `app/settings/wallet-export.tsx` (modal, requires biometric)
- **Purpose:** Export seed phrase or private key with clear warnings. Requires biometric unlock.
- **Source — design:** v3 export flow (recent commit: "export wallet modal, QR identity modal").
- **Backend:** real for local wallets through `WalletService.exportPrivateKey()` / SecureStore-authenticated secret-key export; unavailable for MWA and fixture wallets.
- **Truth note:** this branch reveals raw private-key hex for local wallets, not a mnemonic seed phrase.

### 21. Network config

- **Route:** `app/settings/network.tsx`
- **Purpose:** BLE on/off, LoRa (future), LXMF iface selection (BleOnly / TcpClient / TcpServer / Reticulum), auto-connect toggle.
- **Source — design:** redesign canon list rows.
- **Source — content:** Stitch Settings + v3 patterns + LXMF package `LxmfNodeMode` enum.
- **Backend:** real for BLE toggle and local auto-connect persistence; LXMF mode persists locally but still points at the current stub runtime.

### 22. Privacy toggles

- **Route:** `app/settings/privacy.tsx`
- **Purpose:** Stealth default on/off, tx privacy mode, key rotation cadence.
- **Source — design:** redesign canon.
- **Source — content:** Stitch Settings.
- **Backend:** writes to user preferences service. These defaults seed the send flow and persist locally, but they do **not** mean full end-to-end stealth cryptography is live yet.

### 23. Beacon registry

- **Route:** `app/settings/beacon.tsx`
- **Purpose:** Stake SOL to co-sign confidential txs as a beacon node. Display current stake, stake action, earnings preview. **UI surface only this session**; stake flow displays "coming soon" state after review screen.
- **Source — design:** redesign canon.
- **Source — content:** v3 recent commit "BeaconRegistry — stake SOL".
- **Backend:** stub — `useBeacon` returns placeholder data; real staking lands later.
- **Truth note:** current mode / advertising state can render, but no funds move and no live staking transaction starts from this surface.

### 24. About / Tech deep-dive

- **Route:** `app/settings/about.tsx`
- **Purpose:** Version, licenses, links, "how this works" content (same as onboarding tech drawer, reachable from Settings too).
- **Source — design:** redesign canon minimal/info style.
- **Backend:** none.
- **Truth note:** technology summary and links must distinguish what is already live (BLE peer discovery, wallet/send/history seams, rebuilt core screens) from what is still being completed (LXMF runtime, stealth settlement path, beacon staking).

## Global

### 25. QR scanner

- **Route:** presented as modal on demand from Send recipient and other flows.
- **Purpose:** Scan wallet addresses or identity QRs.
- **Source — design:** OS-standard camera view with overlay. Minimal chrome.
- **Backend:** uses Expo Camera + barcode scanner.

### 26. Toasts / confirmation modals / error banners

- **Location:** primitives in `components/primitives/`, orchestrated from `src/providers/`.
- **Backend:** none.

### 27. `/dev` catalog (dev builds only)

- **Route:** `app/dev/index.tsx`
- **Purpose:** Fixture-backed review lane to preview current `v3-full` screens and regression-check the recovery work.
- **Source — design:** current `v3-full`, kept aligned to redesign canon.
- **Backend:** fixture adapters only.
- **Gate:** visible only when `__DEV__` is true (or env flag).

---

## Source-of-truth summary

| Area | Winning source | Secondary pulls |
|---|---|---|
| Design language (colors, type, shell, depth, glass) | **Redesign canon** | current `src/design-system/`, wireframe references |
| Primitives (DepthButton, Sheet, SlideToConfirm) | **Current `v3-full` contracts, mapped to redesign canon** | historical workbench reference |
| Screen structure + copy | **`screen-inventory.md` + Stitch / wireframe references** | valid current `v3-full` content seams |
| Send flow | Redesign canon + current send route contract | Stitch send |
| Mesh status surfaces | Wireframe pattern + redesign canon | current peer/mesh data hooks |
| Peer components | current `v3-full` peer/domain seams | wireframe peer-row density |
| Messages components | current `v3-full` messaging seams | redesign canon |
| Wallet components | current `v3-full` wallet/transaction seams | redesign canon |
| Onboarding | Stitch / wireframe contract + redesign canon | current onboarding routing |
| Icons | Feather | wireframe custom icons, Anonmesh brand assets |

## Related

- [decisions.md](./decisions.md)
- [architecture.md](./architecture.md)
- [implementation-plan.md](./implementation-plan.md)
