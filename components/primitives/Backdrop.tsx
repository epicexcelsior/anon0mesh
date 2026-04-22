import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Defs,
  Rect,
  RadialGradient as SvgRadialGradient,
  Stop,
} from "react-native-svg";

import { appMotion } from "@/src/design-system/motion";
import { appTheme as theme } from "@/src/design-system/theme";

export type BackdropPreset =
  | "home"
  | "home-stealth"
  | "messages"
  | "peers"
  | "send"
  | "success"
  | "settings";

interface AmbientBlob {
  color: string;
  cx: number;
  cy: number;
  r: number;
  opacity: number;
}

interface BackdropConfig {
  blobs: AmbientBlob[];
  vignette?: boolean;
}

const CONFIGS: Record<BackdropPreset, BackdropConfig> = {
  home: {
    blobs: [
      { color: theme.colors.cyan, cx: 1.02, cy: 0.08, r: 0.72, opacity: 0.14 },
      { color: theme.colors.cyan, cx: -0.08, cy: 0.74, r: 0.56, opacity: 0.05 },
      { color: theme.colors.surfaceElevated, cx: 0.46, cy: 1.08, r: 0.64, opacity: 0.1 },
    ],
    vignette: true,
  },
  "home-stealth": {
    blobs: [
      { color: theme.colors.purple, cx: 1.02, cy: 0.08, r: 0.78, opacity: 0.18 },
      { color: theme.colors.purple, cx: -0.08, cy: 0.6, r: 0.58, opacity: 0.07 },
      { color: theme.colors.purpleShadowSurface, cx: 0.5, cy: 1.08, r: 0.68, opacity: 0.12 },
    ],
    vignette: true,
  },
  messages: {
    blobs: [
      { color: theme.colors.cyan, cx: 1.05, cy: 0.14, r: 0.58, opacity: 0.08 },
      { color: theme.colors.cyan, cx: -0.05, cy: 0.9, r: 0.46, opacity: 0.04 },
    ],
    vignette: true,
  },
  peers: {
    blobs: [
      { color: theme.colors.cyan, cx: 1.02, cy: 0.12, r: 0.7, opacity: 0.12 },
      { color: theme.colors.green, cx: -0.08, cy: 0.78, r: 0.52, opacity: 0.07 },
      { color: theme.colors.surfaceElevated, cx: 0.46, cy: 1.08, r: 0.62, opacity: 0.08 },
    ],
    vignette: true,
  },
  send: {
    blobs: [
      { color: theme.colors.cyan, cx: 1.05, cy: 0.1, r: 0.68, opacity: 0.12 },
      { color: theme.colors.purple, cx: -0.08, cy: 0.72, r: 0.52, opacity: 0.06 },
    ],
    vignette: true,
  },
  success: {
    blobs: [
      { color: theme.colors.green, cx: 1.08, cy: 0.14, r: 0.82, opacity: 0.18 },
      { color: theme.colors.cyan, cx: -0.08, cy: 0.74, r: 0.52, opacity: 0.07 },
      { color: theme.colors.green, cx: 0.5, cy: 0.45, r: 0.46, opacity: 0.05 },
    ],
    vignette: false,
  },
  settings: {
    blobs: [
      { color: theme.colors.purple, cx: 1.05, cy: 0.12, r: 0.7, opacity: 0.12 },
      { color: theme.colors.purple, cx: -0.05, cy: 0.9, r: 0.48, opacity: 0.05 },
    ],
    vignette: true,
  },
};

interface BackdropProps {
  preset: BackdropPreset;
  animated?: boolean;
}

export function Backdrop({ preset, animated = false }: BackdropProps) {
  const config = CONFIGS[preset];

  return (
    <View pointerEvents="none" style={styles.root}>
      <View style={styles.base} />
      <AmbientLayer key={animated ? "stable" : preset} config={config} animated={animated} />
      {config.vignette ? <Vignette /> : null}
    </View>
  );
}

function AmbientLayer({ animated, config }: { animated: boolean; config: BackdropConfig }) {
  const opacity = useSharedValue(animated ? 0 : 1);

  useEffect(() => {
    if (!animated) return;
    opacity.value = 0;
    opacity.value = withTiming(1, {
      duration: appMotion.duration.standard * 1.6,
      easing: appMotion.easing.standard,
    });
  }, [animated, config, opacity]);

  const layerStyle = useAnimatedStyle(() => ({
    opacity: animated ? opacity.value : 1,
  }));

  return (
    <Animated.View style={[styles.layer, layerStyle]}>
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <Defs>
          {config.blobs.map((blob, index) => (
            <SvgRadialGradient
              key={index}
              id={`grad-${index}`}
              cx={`${blob.cx * 100}%`}
              cy={`${blob.cy * 100}%`}
              fx={`${blob.cx * 100}%`}
              fy={`${blob.cy * 100}%`}
              r={`${blob.r * 100}%`}
            >
              <Stop offset="0%" stopColor={blob.color} stopOpacity={blob.opacity} />
              <Stop offset="40%" stopColor={blob.color} stopOpacity={blob.opacity * 0.5} />
              <Stop offset="72%" stopColor={blob.color} stopOpacity={blob.opacity * 0.16} />
              <Stop offset="100%" stopColor={blob.color} stopOpacity={0} />
            </SvgRadialGradient>
          ))}
        </Defs>
        {config.blobs.map((_, index) => (
          <Rect key={`fill-${index}`} fill={`url(#grad-${index})`} height="100" width="100" x="0" y="0" />
        ))}
      </Svg>
    </Animated.View>
  );
}

function Vignette() {
  return (
    <>
      <LinearGradient
        colors={[theme.colors.vignetteTop, theme.colors.transparent]}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
        start={{ x: 0.5, y: 0 }}
        style={styles.vignetteTop}
      />
      <LinearGradient
        colors={[theme.colors.transparent, theme.colors.vignetteBottom]}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
        start={{ x: 0.5, y: 0 }}
        style={styles.vignetteBottom}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject },
  base: { ...StyleSheet.absoluteFillObject, backgroundColor: theme.colors.background },
  layer: { ...StyleSheet.absoluteFillObject },
  vignetteTop: { height: 140, left: 0, position: "absolute", right: 0, top: 0 },
  vignetteBottom: { bottom: 0, height: 220, left: 0, position: "absolute", right: 0 },
});
