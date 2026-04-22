import { foundationTokens } from "@/src/design-system/tokens/foundation";

const palette = foundationTokens.palette;

export const semanticColorTokens = {
  transparent: palette.transparent,
  background: palette.obsidian950,
  backgroundSoft: "#071113",
  backgroundRaised: palette.obsidian850,
  backgroundGlow: "rgba(34, 211, 238, 0.05)",

  surface: palette.obsidian900,
  surfaceMuted: palette.obsidian850,
  surfaceElevated: palette.obsidian800,
  surfaceContainerHigh: palette.obsidian775,
  surfaceContainerLow: "#0D171A",
  surfaceContainerLowest: "rgba(10, 18, 20, 0.82)",
  surfaceInset: "#081012",
  surfaceOnAccent: "rgba(5, 10, 10, 0.14)",
  surfaceOnAccentStrong: "rgba(5, 10, 10, 0.18)",
  purpleShadowSurface: "#120C1D",

  surfaceCardTop: "#101A1D",
  surfaceCardBottom: "#081012",
  surfaceListTop: "#111C20",
  surfaceListBottom: "#091215",
  surfaceProofTop: "rgba(139, 92, 246, 0.16)",
  surfaceProofBottom: "#0A1214",
  surfaceSuccessTop: "rgba(52, 211, 153, 0.16)",
  surfaceSuccessBottom: "#0A1214",
  surfaceUtilityTop: "#0F1A1E",
  surfaceUtilityBottom: "#071113",

  surfaceHeroTop: "#0F1A1E",
  surfaceHeroBottom: "#071113",
  cardCyanTop: "rgba(34, 211, 238, 0.16)",
  cardCyanBottom: "#0A1214",
  cardPurpleTop: "rgba(139, 92, 246, 0.18)",
  cardPurpleBottom: "#0A1214",

  line: "rgba(255, 255, 255, 0.05)",
  lineStrong: "rgba(255, 255, 255, 0.09)",
  hairline: "rgba(255, 255, 255, 0.06)",
  outlineVariant: palette.obsidian650,

  textPrimary: palette.frost50,
  textSecondary: palette.slate200,
  textTertiary: "rgba(138, 154, 154, 0.84)",
  textMuted: "#5D6969",
  textOnAccent: palette.obsidian950,
  textOnAccentMuted: "rgba(5, 10, 10, 0.72)",
  onSurfaceVariant: palette.slate200,

  cyan: palette.cyan500,
  cyanDim: palette.cyan600,
  cyanSoft: "rgba(34, 211, 238, 0.15)",
  cyanGlow: "rgba(34, 211, 238, 0.18)",
  cyanGlowStrong: "rgba(34, 211, 238, 0.28)",
  cyanBorderSoft: "rgba(34, 211, 238, 0.18)",
  cyanBorderStrong: "rgba(34, 211, 238, 0.26)",

  amber: palette.amber500,
  amberLight: palette.amber350,
  amberSoft: "rgba(245, 158, 11, 0.16)",
  amberGlow: "rgba(245, 158, 11, 0.24)",
  amberBorderSoft: "rgba(245, 158, 11, 0.20)",

  green: palette.green500,
  greenSoft: "rgba(52, 211, 153, 0.14)",
  greenGlow: "rgba(52, 211, 153, 0.22)",
  greenGlowStrong: "rgba(52, 211, 153, 0.3)",
  greenBorderSoft: "rgba(52, 211, 153, 0.18)",
  greenBorderStrong: "rgba(52, 211, 153, 0.22)",

  red: palette.red500,
  redLight: palette.red350,
  redSoft: "rgba(239, 68, 68, 0.14)",
  redGlow: "rgba(239, 68, 68, 0.22)",
  errorContainer: "rgba(239, 68, 68, 0.10)",
  errorOutline: "rgba(239, 68, 68, 0.24)",
  redBorderSoft: "rgba(239, 68, 68, 0.20)",

  purple: palette.purple500,
  purpleLight: palette.purple350,
  purpleSoft: "rgba(139, 92, 246, 0.15)",
  purpleGlow: "rgba(139, 92, 246, 0.22)",
  purpleGlowStrong: "rgba(139, 92, 246, 0.3)",
  purpleBorderSoft: "rgba(139, 92, 246, 0.22)",

  nav: "rgba(5, 10, 10, 0.96)",
  navTop: "rgba(15, 26, 30, 0.96)",
  navBottom: "rgba(5, 10, 10, 0.98)",
  navIndicatorTop: "rgba(34, 211, 238, 0.18)",
  navIndicatorBottom: "rgba(34, 211, 238, 0.08)",
  scrim: "rgba(0, 0, 0, 0.72)",
  overlay: "rgba(5, 10, 10, 0.78)",
  shadow: palette.black,
  vignetteTop: "rgba(0, 0, 0, 0.28)",
  vignetteBottom: "rgba(0, 0, 0, 0.42)",
  whiteWashFaint: "rgba(255, 255, 255, 0.02)",
  whiteWashSubtle: "rgba(255, 255, 255, 0.04)",
  whiteWash: "rgba(255, 255, 255, 0.06)",
  whiteWashStrong: "rgba(255, 255, 255, 0.10)",

  cyanLight: palette.cyan450,
  cyanAccent: palette.cyan500,
  greenLight: palette.green350,
} as const;

export const semanticShadowTokens = {
  card: {
    shadowColor: foundationTokens.palette.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  nav: {
    shadowColor: foundationTokens.palette.black,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
  },
  glow: {
    shadowColor: semanticColorTokens.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },
  soft: {
    shadowColor: foundationTokens.palette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
} as const;

export const semanticTokens = {
  colors: semanticColorTokens,
  shadow: semanticShadowTokens,
} as const;

export type SemanticTokens = typeof semanticTokens;
