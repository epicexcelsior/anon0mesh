import { foundationTokens } from "@/src/design-system/tokens/foundation";

const palette = foundationTokens.palette;

export const semanticColorTokens = {
  background: palette.obsidian950,
  backgroundSoft: palette.obsidian900,
  backgroundRaised: palette.obsidian850,
  backgroundGlow: "#16181b",

  surface: palette.obsidian800,
  surfaceMuted: palette.obsidian775,
  surfaceElevated: palette.obsidian750,
  surfaceContainerHigh: palette.obsidian700,
  surfaceContainerLow: palette.obsidian850,
  surfaceContainerLowest: palette.obsidian900,
  surfaceInset: "#111316",

  surfaceCardTop: "#1d2024",
  surfaceCardBottom: "#121417",
  surfaceListTop: "#202328",
  surfaceListBottom: "#15181c",
  surfaceProofTop: "#172228",
  surfaceProofBottom: "#101417",
  surfaceSuccessTop: "#17231b",
  surfaceSuccessBottom: "#101412",
  surfaceUtilityTop: "#191c21",
  surfaceUtilityBottom: "#111316",

  surfaceHeroTop: "#1a1c1f",
  surfaceHeroBottom: "#101113",
  cardCyanTop: "#1c2a31",
  cardCyanBottom: "#101618",
  cardPurpleTop: "#1c1726",
  cardPurpleBottom: "#0e0c14",

  line: "rgba(255, 255, 255, 0.07)",
  lineStrong: "rgba(255, 255, 255, 0.13)",
  hairline: "rgba(255, 255, 255, 0.08)",
  outlineVariant: palette.obsidian650,

  textPrimary: palette.frost50,
  textSecondary: "rgba(243, 247, 250, 0.82)",
  textTertiary: "rgba(243, 247, 250, 0.70)",
  textMuted: "rgba(243, 247, 250, 0.56)",
  textOnAccent: palette.obsidian950,
  onSurfaceVariant: palette.slate200,

  cyan: palette.cyan500,
  cyanDim: palette.cyan600,
  cyanSoft: "rgba(0, 218, 243, 0.16)",
  cyanGlow: "rgba(0, 218, 243, 0.32)",
  cyanGlowStrong: "rgba(0, 218, 243, 0.42)",

  amber: palette.amber500,
  amberSoft: "rgba(255, 191, 0, 0.18)",
  amberGlow: "rgba(255, 191, 0, 0.32)",

  green: palette.green500,
  greenSoft: "rgba(60, 227, 106, 0.16)",
  greenGlow: "rgba(60, 227, 106, 0.32)",
  greenGlowStrong: "rgba(60, 227, 106, 0.42)",

  red: palette.red500,
  redSoft: "rgba(204, 102, 102, 0.18)",
  redGlow: "rgba(204, 102, 102, 0.28)",
  errorContainer: "rgba(204, 102, 102, 0.12)",
  errorOutline: "rgba(204, 102, 102, 0.30)",

  purple: palette.purple500,
  purpleSoft: "rgba(139, 95, 191, 0.16)",
  purpleGlow: "rgba(139, 95, 191, 0.34)",
  purpleGlowStrong: "rgba(139, 95, 191, 0.44)",

  nav: "rgba(13, 14, 16, 0.86)",
  scrim: "rgba(0, 0, 0, 0.62)",
  overlay: "rgba(10, 11, 13, 0.72)",
  shadow: palette.black,

  cyanLight: palette.cyan350,
  cyanAccent: palette.cyan450,
  greenLight: palette.green350,
} as const;

export const semanticShadowTokens = {
  card: {
    shadowColor: foundationTokens.palette.black,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.32,
    shadowRadius: 30,
    elevation: 8,
  },
  nav: {
    shadowColor: foundationTokens.palette.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.34,
    shadowRadius: 24,
    elevation: 12,
  },
  glow: {
    shadowColor: semanticColorTokens.cyan,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 10,
  },
  soft: {
    shadowColor: foundationTokens.palette.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
} as const;

export const semanticTokens = {
  colors: semanticColorTokens,
  shadow: semanticShadowTokens,
} as const;

export type SemanticTokens = typeof semanticTokens;
