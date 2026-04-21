import { BlurView } from "expo-blur";
import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { GlassVariant, glassVariants } from "@/src/design-system/glass";

/**
 * Native module present after expo prebuild — blur is active.
 */
export const ENABLE_BLUR = true;

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
  const flattenedStyle = StyleSheet.flatten(style);
  const radiusStyle = {
    borderBottomLeftRadius: flattenedStyle?.borderBottomLeftRadius,
    borderBottomRightRadius: flattenedStyle?.borderBottomRightRadius,
    borderRadius: flattenedStyle?.borderRadius,
    borderTopLeftRadius: flattenedStyle?.borderTopLeftRadius,
    borderTopRightRadius: flattenedStyle?.borderTopRightRadius,
  };

  if (ENABLE_BLUR) {
    return (
      <BlurView intensity={config.blurIntensity} tint="dark" style={[style, styles.clip]}>
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.clip,
            radiusStyle,
            { backgroundColor: config.overlay },
          ]}
        />
        <View style={[styles.border, radiusStyle, { borderColor: config.border }]} />
        {children}
      </BlurView>
    );
  }

  return (
    <View
      style={[
        { backgroundColor: config.fallbackBg, borderColor: config.border },
        styles.border,
        styles.clip,
        radiusStyle,
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
  },
  clip: { overflow: "hidden" },
});
