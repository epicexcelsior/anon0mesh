import {
  componentTokens,
  foundationTokens,
  semanticTokens,
  stateTokens,
} from "@/src/design-system/tokens";

export const appTheme = {
  colors: semanticTokens.colors,
  component: componentTokens,
  depth: stateTokens.depth,
  feedback: stateTokens.feedback,
  fonts: foundationTokens.fonts,
  radius: foundationTokens.radius,
  shadow: semanticTokens.shadow,
  spacing: foundationTokens.spacing,
  type: foundationTokens.type,
} as const;

export type AppTheme = typeof appTheme;

export function useTheme() {
  return appTheme;
}
