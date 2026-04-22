import { foundationTokens } from "@/src/design-system/tokens/foundation";
import { semanticColorTokens } from "@/src/design-system/tokens/semantic";

const spacing = foundationTokens.spacing;
const radius = foundationTokens.radius;
const type = foundationTokens.type;

export const componentTokens = {
  surface: {
    gradients: {
      default: [semanticColorTokens.surfaceCardTop, semanticColorTokens.surfaceCardBottom],
      cyan: [semanticColorTokens.cardCyanTop, semanticColorTokens.cardCyanBottom],
      proof: [semanticColorTokens.surfaceProofTop, semanticColorTokens.surfaceProofBottom],
      soft: [semanticColorTokens.surfaceUtilityTop, semanticColorTokens.surfaceUtilityBottom],
      success: [semanticColorTokens.surfaceSuccessTop, semanticColorTokens.surfaceSuccessBottom],
    },
  },
  button: {
    sizes: {
      sm: { minHeight: 36, paddingX: spacing.md, fontSize: type.caption },
      md: { minHeight: 46, paddingX: spacing.lg, fontSize: type.body },
      lg: { minHeight: 52, paddingX: spacing.xl, fontSize: type.bodyLg },
    },
    contentGap: spacing.sm,
    highlightInset: spacing.md,
  },
  nav: {
    barHeight: 72,
    wrapperInset: 0,
    minimumBottomOffset: 0,
    paddingX: spacing.sm,
    paddingY: spacing.xs,
    tabMinHeight: 56,
    indicatorInsetY: spacing.xs,
    indicatorInsetX: spacing.xs,
    indicatorGlowInset: spacing.sm,
  },
  rows: {
    info: {
      minHeight: 64,
    },
    list: {
      minHeight: 64,
      iconSize: 36,
      paddingX: spacing.lg,
      paddingY: spacing.md,
      dividerInset: 64,
    },
    identity: {
      minHeight: 76,
      avatarSize: 48,
      presenceDotSize: 12,
      trailingMinWidth: 48,
      paddingX: spacing.lg,
      paddingY: spacing.md,
    },
    activity: {
      minHeight: 76,
      iconSize: 36,
      trailingMinWidth: 72,
      paddingX: spacing.lg,
      paddingY: spacing.md,
    },
    badge: {
      minHeight: 22,
      minWidth: 22,
    },
    statePill: {
      minHeight: 20,
    },
  },
  sheet: {
    topRadius: radius.xl,
    paddingX: spacing.lg,
    paddingTop: spacing.sm,
    contentBottomBase: spacing.xxl,
    handleWidth: 36,
    highlightInset: spacing.lg,
    actionMinHeight: 52,
  },
  slider: {
    trackHeight: 56,
    trackRadius: 28,
    knobSize: 48,
    knobRadius: 24,
    knobInset: 4,
    threshold: 0.72,
    magnetStart: 0.58,
    resistanceStart: 0.84,
  },
  recipes: {
    heroCardRadius: radius.xl,
    moduleCardRadius: radius.lg,
    utilityCardRadius: radius.md,
  },
} as const;

export type ComponentTokens = typeof componentTokens;
