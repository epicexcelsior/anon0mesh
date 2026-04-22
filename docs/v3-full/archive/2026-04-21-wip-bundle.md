# 2026-04-21 prior-session WIP bundle

This commit captures uncommitted work found in the working tree at the start of the 2026-04-21 Phase 1 convergence session. Bundled as a single `wip:` commit so it is not lost, and documented here so it can be reviewed, split, or amended later.

## Why bundled

Phase 1 of the ship-convergence plan required editing 14 files that overlapped with this uncommitted WIP. Rather than blend Phase 1 primitive-migration edits into unrelated functional WIP, the decision was to preserve the WIP as-is in one commit first, then do Phase 1 work on top with clean attribution.

## Scope of the bundle

**44 files touched · +611 / −344 lines · 0 untracked files**

By area:

### Wallet runtime
- `src/infrastructure/solana/SolanaAdapter.ts` (+~90 net)
- `src/infrastructure/solana/index.ts`
- `src/infrastructure/wallet/LocalWallet.ts`
- `src/infrastructure/wallet/LocalWalletAdapter.ts`
- `src/infrastructure/wallet/MWAWalletAdapter.ts`
- `src/solana/SolanaTransactionManager.ts`
- `src/providers/AdapterProvider.tsx`
- `src/hooks/useWallet.ts`
- `src/hooks/useTransaction.ts`
- `src/hooks/useLocalDisplayName.ts`

Likely scope: wallet adapter wiring, local-wallet export path refinements, transaction manager tweaks.

### Home surface
- `app/(tabs)/home.tsx` — adds `useWallet` hook, drills `mode / wallet / loading / exportState` into `HomeHero` and `BalanceCard`
- `components/home/HomeHero.tsx` (+34)
- `components/home/BalanceCard.tsx` (+97 — the biggest component change)

### Settings surface
- `app/(tabs)/settings.tsx`
- `app/settings/identity.tsx` (+50)
- `app/settings/network.tsx`
- `components/settings/IdentityCard.tsx` (+39)
- `components/settings/SettingsScaffold.tsx` (+22)
- `components/settings/SettingsRow.tsx`

### Onboarding surface
- `app/onboarding/welcome.tsx` (+30)
- `app/onboarding/setup.tsx` (+42)
- `app/onboarding/tech-drawer.tsx`
- `components/onboarding/WalletPathPicker.tsx`
- `app/index.tsx` (landing — +22)

### Messages surface
- `app/(tabs)/messages.tsx` — copy tightening (trimmed hero copy)
- `components/messages/ConversationRow.tsx`
- `components/messages/MessageBubble.tsx`

### Tokens and primitives
- `src/design-system/tokens/semantic.ts` (+25)
- `src/design-system/tokens/component.ts` (14 lines changed)
- `components/primitives/DepthButton.tsx` (+33)
- `components/primitives/BottomNav.tsx` (+17)
- `components/primitives/Backdrop.tsx`
- `components/primitives/Icon.tsx`
- `components/primitives/NumericKeypad.tsx`
- `components/primitives/Pill.tsx`
- `components/primitives/SlideToConfirm.tsx`
- `components/mesh/MeshStatusStrip.tsx`
- `components/send/RecipientPeerCard.tsx`
- `components/shared/ReceiveCard.tsx`
- `components/ui/Header.tsx`
- `components/screens/SolanaTransactionScreen.tsx` (+19)

### Gossip / polyfills / misc
- `src/polyfills.ts` (**138 lines changed** — largest single file, probably rewrite)
- `src/gossip/GCSFilter.ts`
- `src/gossip/PacketIdUtil.ts`

## Recovery paths

Everything here is preserved in git. To work with it later:

```bash
# See the full bundle
git show <this-commit-hash>

# Extract just one file's changes from the bundle
git show <this-commit-hash> -- path/to/file.tsx

# Revert the bundle (will conflict with Phase 1 edits if both touched the same file)
git revert <this-commit-hash>

# Split the bundle into themed commits later (interactive rebase)
git rebase -i <parent-of-this-commit>
# then use "edit" on the wip commit and git reset HEAD~ to re-stage piecemeal
```

## What this bundle is NOT

- Not Phase 1 work (primitive consistency migration). That lands in later commits.
- Not duplicate work with Phase 1 — the scopes are orthogonal (functional wiring vs press mechanics).
- Not intended to ship as-is. Review and potentially split before PR.

## After Phase 1 completes

Recommended next moves for this bundle:
1. Walk through each area on device and verify the changes are intended
2. Either keep as one `wip:` commit, split into themed commits via `git rebase -i`, or amend/squash into Phase 2+ work where it belongs
3. The cleanest long-term state is: this commit gets split into `feat(wallet):`, `feat(home):`, `feat(settings):`, `feat(onboarding):`, `refactor(polyfills):`, `chore(tokens):` etc. during Phase 2 screen rebuilds where relevant
