export const stateTokens = {
  depth: {
    pressInset: "rgba(0, 0, 0, 0.62)",
    pressInsetSub: "rgba(0, 0, 0, 0.42)",
    pressHighlight: "rgba(255, 255, 255, 0.05)",
    restHighlight: "rgba(255, 255, 255, 0.16)",
    bottomInset: "rgba(0, 0, 0, 0.38)",
    restShadow: "rgba(0, 0, 0, 0.45)",
    restShadowSub: "rgba(0, 0, 0, 0.25)",
    pressFill: "rgba(0, 0, 0, 0.14)",
  },
  feedback: {
    disabledOpacity: 0.45,
    buttonPressedOpacity: 0.92,
    listPressedWash: "rgba(255, 255, 255, 0.03)",
  },
} as const;

export type StateTokens = typeof stateTokens;
