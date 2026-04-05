---
name: AnonMesh UI redesign decisions
description: Key design decisions and deviations for the Void Protocol UI redesign, aligned to current app functionality as of 2026-04-04.
type: project
---

**Navigation:** 4 tabs — Chat, Wallet (with [Balance|History] segmented control), Mesh, Profile. Implemented in `app/(tabs)/_layout.tsx` with custom `VoidTabBar.tsx`.

**Design system:** Void Protocol (`constants/void-protocol.ts`, import as `VP`). Dark AMOLED theme: #050A0A void bg, #22D3EE cyan accent, #8B5CF6 purple (stealth only). Space Grotesk UI font, JetBrains Mono for technical data.

**Canonical Stitch screens:** Currently favorited screens in Stitch project `13755964089108508928`. Use `mcp__stitch__list_screens` to fetch.

**Swap feature:** REMOVED (deviated from original plan which said "Coming Soon"). Not in Stitch designs.

**Mesh visualization:** Zone system kept, restyled. Constellation node graph deferred.

**Roadmap-only wallet recovery UI:** HIDDEN for now. Seed export/import screens were removed from the live route surface because they were mockups without real backing behavior in the current app.

**Device target:** Solana Mobile Seeker (Android, ~360x800dp, AMOLED)

**Conversion pattern:** Treat Stitch imports as screen shells, not feature requirements. Replace LinearGradient with VoidScreen, remove SafeAreaView import, replace all hardcoded colors with VP tokens, use VoidCard for cards, and wire actions only to functionality the app already supports today.

**Navigation cleanup:** Canonical app paths now live under the tab group, with push screens using explicit file routes like `chat/thread`, `mesh/[peerId]`, and `wallet/send`. Duplicate top-level wrappers for `chat`, `wallet`, and `profile` were removed to avoid route collisions.

**Verification status:** `npx tsc --noEmit` passes. `npm run lint` passes with warnings only. `CI=1 npx expo export --platform web` succeeds.

**Key docs:** CONTEXT.md in repo root is the living tracker. Plan at `~/.claude/plans/mossy-popping-quokka.md`.

**Why:** Hackathon submission but production-grade quality expected. Targeting judges who evaluate both technical depth and UX polish.

**How to apply:** Read CONTEXT.md first in every session. Follow the conversion pattern. Update CONTEXT.md after each phase. Never diminish quality as "fine for hackathon."
