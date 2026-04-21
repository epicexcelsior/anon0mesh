import { LinearGradient } from "expo-linear-gradient";
import * as haptics from "@/src/design-system/haptics";
import * as sound from "@/src/design-system/sound";
import React, { useEffect } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { appMotion, scaled } from "@/src/design-system/motion";
import { appTheme as theme } from "@/src/design-system/theme";

export type DepthButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "ghost";

export type DepthButtonSize = "sm" | "md" | "lg";
export type DepthButtonTone = "cyan" | "green" | "red" | "purple" | "amber";

export interface DepthButtonProps {
  children?: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  label?: string;
  onPress?: () => void;
  previewPressed?: boolean;
  size?: DepthButtonSize;
  style?: StyleProp<ViewStyle>;
  tone?: DepthButtonTone;
  variant?: DepthButtonVariant;
}

const PRIMARY_GRADIENTS: Record<DepthButtonTone, [string, string]> = {
  cyan: [theme.colors.cyanLight, theme.colors.cyanDim],
  green: [theme.colors.greenLight, theme.colors.green],
  purple: ["#A78BFA", theme.colors.purple],
  amber: ["#FBBF24", theme.colors.amber],
  red: ["#F87171", theme.colors.red],
};

const SECONDARY_GRADIENT: [string, string] = ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.02)"];
const DANGER_GRADIENT: [string, string] = [
  "rgba(239, 68, 68, 0.18)",
  "rgba(239, 68, 68, 0.08)",
];
const SUCCESS_GRADIENT: [string, string] = [theme.colors.greenLight, theme.colors.green];
const GHOST_GRADIENT: [string, string] = ["transparent", "transparent"];

function getGradient(variant: DepthButtonVariant, tone: DepthButtonTone): [string, string] {
  switch (variant) {
    case "primary": return PRIMARY_GRADIENTS[tone];
    case "secondary": return SECONDARY_GRADIENT;
    case "success": return SUCCESS_GRADIENT;
    case "danger": return DANGER_GRADIENT;
    case "ghost": return GHOST_GRADIENT;
  }
}

function getTextColor(variant: DepthButtonVariant, tone: DepthButtonTone): string {
  switch (variant) {
    case "primary":
    case "success":
      return theme.colors.textOnAccent;
    case "secondary":
      return theme.colors.textPrimary;
    case "danger":
      return theme.colors.red;
    case "ghost":
      return toneColor(tone);
  }
}

function getBorderColor(variant: DepthButtonVariant, tone: DepthButtonTone): string {
  switch (variant) {
    case "primary": return `${toneColor(tone)}33`;
    case "secondary": return theme.colors.lineStrong;
    case "success": return "rgba(52, 211, 153, 0.22)";
    case "danger": return theme.colors.errorOutline;
    case "ghost": return theme.colors.lineStrong;
  }
}

function toneColor(tone: DepthButtonTone): string {
  const map: Record<DepthButtonTone, string> = {
    cyan: theme.colors.cyan,
    green: theme.colors.green,
    red: theme.colors.red,
    purple: theme.colors.purple,
    amber: theme.colors.amber,
  };
  return map[tone];
}

const SIZE_CONFIG = {
  sm: {
    minHeight: theme.component.button.sizes.sm.minHeight,
    px: theme.component.button.sizes.sm.paddingX,
    fontSize: theme.component.button.sizes.sm.fontSize,
  },
  md: {
    minHeight: theme.component.button.sizes.md.minHeight,
    px: theme.component.button.sizes.md.paddingX,
    fontSize: theme.component.button.sizes.md.fontSize,
  },
  lg: {
    minHeight: theme.component.button.sizes.lg.minHeight,
    px: theme.component.button.sizes.lg.paddingX,
    fontSize: theme.component.button.sizes.lg.fontSize,
  },
} satisfies Record<DepthButtonSize, { minHeight: number; px: number; fontSize: number }>;

export function DepthButton({
  children,
  disabled = false,
  icon,
  label,
  onPress,
  previewPressed,
  size = "lg",
  style,
  tone = "cyan",
  variant = "primary",
}: DepthButtonProps) {
  const pressed = useSharedValue(0);
  const { compression } = appMotion.press;

  const handlePressIn = () => {
    if (disabled || previewPressed !== undefined) return;
    pressed.value = withTiming(1, {
      duration: scaled(appMotion.duration.press),
      easing: appMotion.easing.standard,
    });
    if (variant === "danger") {
      haptics.warning();
      sound.warning();
    } else {
      haptics.tap();
      sound.buttonTap();
    }
  };

  const handlePressOut = () => {
    if (disabled || previewPressed !== undefined) return;
    pressed.value = withTiming(0, {
      duration: scaled(appMotion.duration.release),
      easing: appMotion.easing.emphasis,
    });
  };

  useEffect(() => {
    if (previewPressed === undefined) return;
    pressed.value = withTiming(previewPressed ? 1 : 0, {
      duration: scaled(
        previewPressed ? appMotion.duration.press : appMotion.duration.release,
      ),
      easing: previewPressed ? appMotion.easing.standard : appMotion.easing.emphasis,
    });
  }, [previewPressed, pressed]);

  const shellStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(pressed.value, [0, 1], [1, compression.scale]) },
      { translateY: interpolate(pressed.value, [0, 1], [0, compression.translateY]) },
    ],
    shadowOpacity: interpolate(pressed.value, [0, 1], [0.38, 0.14]),
  }));

  const highlightStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pressed.value, [0, 1], [1, 0.28]),
  }));

  const bottomInsetStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pressed.value, [0, 1], [1, 0.25]),
  }));

  const innerShadowStyle = useAnimatedStyle(() => ({
    opacity: pressed.value,
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: pressed.value,
  }));

  const sizeConfig = SIZE_CONFIG[size];
  const gradient = getGradient(variant, tone);
  const textColor = getTextColor(variant, tone);
  const borderColor = getBorderColor(variant, tone);
  const showHighlight = variant !== "ghost";
  const showShadow = variant !== "ghost";
  const showInnerShadow = variant !== "ghost";
  const showBottomInset = variant !== "secondary" && variant !== "ghost";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      hitSlop={6}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={style}
    >
      <Animated.View style={[shellStyle, showShadow && styles.shadow, disabled && styles.disabled]}>
        <LinearGradient
          colors={gradient}
          end={{ x: 0.5, y: 1 }}
          start={{ x: 0.5, y: 0 }}
          style={[
            styles.fill,
            {
              borderColor,
              minHeight: sizeConfig.minHeight,
              paddingHorizontal: sizeConfig.px,
            },
          ]}
        >
          {showInnerShadow && (
            <LinearGradient
              colors={["rgba(255,255,255,0.06)", "rgba(0,0,0,0.14)"]}
              end={{ x: 1, y: 1 }}
              pointerEvents="none"
              start={{ x: 0, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          )}
          {showInnerShadow && (
            <Animated.View pointerEvents="none" style={[styles.innerTopShadow, innerShadowStyle]}>
              <LinearGradient
                colors={[theme.depth.pressInset, "rgba(0,0,0,0)"]}
                end={{ x: 0.5, y: 1 }}
                start={{ x: 0.5, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          )}
          {showInnerShadow && (
            <Animated.View pointerEvents="none" style={[styles.innerTopHardLine, innerShadowStyle]} />
          )}
          {showHighlight && (
            <Animated.View pointerEvents="none" style={[styles.highlight, highlightStyle]} />
          )}
          {showBottomInset && (
            <Animated.View pointerEvents="none" style={[styles.bottomInset, bottomInsetStyle]} />
          )}
          <Animated.View pointerEvents="none" style={[styles.pressOverlay, overlayStyle]} />
          <View style={styles.content}>
            {children ?? (
              <>
                {icon}
                {label ? (
                  <Text style={[styles.label, { color: textColor, fontSize: sizeConfig.fontSize }]}>
                    {label}
                  </Text>
                ) : null}
              </>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 4,
  },
  disabled: {
    opacity: theme.feedback.disabledOpacity,
  },
  fill: {
    alignItems: "center",
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  innerTopShadow: {
    height: "56%",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  innerTopHardLine: {
    backgroundColor: theme.depth.pressInsetSub,
    height: 1,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  highlight: {
    backgroundColor: theme.depth.restHighlight,
    height: 1,
    left: theme.component.button.highlightInset,
    position: "absolute",
    right: theme.component.button.highlightInset,
    top: 0,
  },
  bottomInset: {
    backgroundColor: theme.depth.bottomInset,
    bottom: 0,
    height: 1,
    left: 0,
    position: "absolute",
    right: 0,
  },
  pressOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.depth.pressFill,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "center",
    zIndex: 1,
  },
  label: {
    fontFamily: theme.fonts.bodyMedium,
  },
});
