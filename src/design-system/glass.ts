export type GlassVariant = "regular" | "soft" | "accent" | "strong";

export const glassVariants: Record<
  GlassVariant,
  { overlay: string; blurIntensity: number; border: string; fallbackBg: string }
> = {
  regular: {
    overlay: "rgba(10, 18, 20, 0.56)",
    blurIntensity: 36,
    border: "rgba(255, 255, 255, 0.05)",
    fallbackBg: "rgba(10, 18, 20, 0.88)",
  },
  soft: {
    overlay: "rgba(5, 10, 10, 0.68)",
    blurIntensity: 24,
    border: "rgba(255, 255, 255, 0.05)",
    fallbackBg: "rgba(5, 10, 10, 0.92)",
  },
  accent: {
    overlay: "rgba(34, 211, 238, 0.10)",
    blurIntensity: 40,
    border: "rgba(34, 211, 238, 0.18)",
    fallbackBg: "rgba(8, 19, 23, 0.92)",
  },
  strong: {
    overlay: "rgba(15, 26, 30, 0.72)",
    blurIntensity: 54,
    border: "rgba(255, 255, 255, 0.06)",
    fallbackBg: "rgba(15, 26, 30, 0.94)",
  },
};
