import { GlassVariant, glassVariants } from "@/src/design-system/glass";

export function useGlass(variant: GlassVariant = "regular") {
  return glassVariants[variant];
}
