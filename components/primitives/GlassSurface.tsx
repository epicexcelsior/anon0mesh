import { BlurView } from "expo-blur";
import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { GlassVariant, glassVariants } from "@/src/design-system/glass";

/**
 * Flip to true after `npx expo prebuild && npx expo run:android` so the
 * expo-blur native module is present. Until then the fallback translucent
 * View is used, which approximates the look well enough to ship.
 */
export const ENABLE_BLUR = false;

interface GlassSurfaceProps {
  variant?: GlassVariant;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function GlassSurface({
  variant = "regular",
  style,
  children,
}: GlassSurfaceProps) {
  const config = glassVariants[variant];

  if (ENABLE_BLUR) {
    return (
      <BlurView intensity={config.blurIntensity} tint="dark" style={style}>
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: config.overlay },
          ]}
        />
        <View style={[styles.border, { borderColor: config.border }]} />
        {children}
      </BlurView>
    );
  }

  return (
    <View
      style={[
        { backgroundColor: config.fallbackBg, borderColor: config.border },
        styles.border,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  border: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 1,
  },
});
