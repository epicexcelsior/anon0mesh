import type { AudioSource } from "expo-audio";

export type SoundEvent =
  | "tabTap"
  | "sheetOpen"
  | "sheetClose"
  | "sliderThreshold"
  | "sliderConfirm"
  | "successResolve"
  | "buttonTap"
  | "toggleOn"
  | "toggleOff"
  | "warning";

export interface SoundDefinition {
  description: string;
  source: AudioSource | null;
  volume: number;
}

export const soundCatalog = {
  tabTap: {
    description: "Quiet navigation tick for root-tab changes only.",
    source: require("@/assets/sounds/workbench/tab-tap.wav") as AudioSource,
    volume: 0.16,
  },
  sheetOpen: {
    description: "Soft lift cue when a bottom sheet takes focus.",
    source: require("@/assets/sounds/workbench/sheet-open.wav") as AudioSource,
    volume: 0.24,
  },
  sheetClose: {
    description: "Short release cue when a bottom sheet dismisses.",
    source: require("@/assets/sounds/workbench/sheet-close.wav") as AudioSource,
    volume: 0.18,
  },
  sliderThreshold: {
    description: "Small precision cue when the send slider crosses commit threshold.",
    source: require("@/assets/sounds/workbench/slider-threshold.wav") as AudioSource,
    volume: 0.22,
  },
  sliderConfirm: {
    description: "Protected-send commit cue paired with final confirm haptic.",
    source: require("@/assets/sounds/workbench/slider-confirm.wav") as AudioSource,
    volume: 0.3,
  },
  successResolve: {
    description: "Final settle cue after the success rail fully resolves.",
    source: require("@/assets/sounds/workbench/success-resolve.wav") as AudioSource,
    volume: 0.34,
  },
  buttonTap: {
    description: "Soft UI click for DepthButton and keypad presses.",
    source: require("@/assets/sounds/workbench/button-tap.wav") as AudioSource,
    volume: 0.14,
  },
  toggleOn: {
    description: "Rising chirp when a toggle flips on.",
    source: require("@/assets/sounds/workbench/toggle-on.wav") as AudioSource,
    volume: 0.18,
  },
  toggleOff: {
    description: "Falling chirp when a toggle flips off.",
    source: require("@/assets/sounds/workbench/toggle-off.wav") as AudioSource,
    volume: 0.16,
  },
  warning: {
    description: "Low-mid warning buzz for destructive / danger button press.",
    source: require("@/assets/sounds/workbench/warning.wav") as AudioSource,
    volume: 0.22,
  },
} satisfies Record<SoundEvent, SoundDefinition>;
