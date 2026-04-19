export type GlassVariant = "regular" | "soft" | "accent" | "strong";

export const glassVariants: Record<
  GlassVariant,
  { overlay: string; blurIntensity: number; border: string; fallbackBg: string }
> = {
  regular: {
    overlay: "rgba(255,255,255,0.045)",
    blurIntensity: 40,
    border: "rgba(255,255,255,0.1)",
    fallbackBg: "rgba(22,23,24,0.88)",
  },
  soft: {
    overlay: "rgba(255,255,255,0.03)",
    blurIntensity: 30,
    border: "rgba(255,255,255,0.08)",
    fallbackBg: "rgba(13,14,16,0.90)",
  },
  accent: {
    overlay: "rgba(60,227,106,0.08)",
    blurIntensity: 40,
    border: "rgba(60,227,106,0.22)",
    fallbackBg: "rgba(17,24,20,0.90)",
  },
  strong: {
    overlay: "rgba(255,255,255,0.07)",
    blurIntensity: 60,
    border: "rgba(255,255,255,0.14)",
    fallbackBg: "rgba(26,28,31,0.92)",
  },
};
