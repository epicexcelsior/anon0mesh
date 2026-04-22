import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import * as haptics from "@/src/design-system/haptics";
import { Icon } from "@/components/primitives/Icon";
import { appMotion, scaled } from "@/src/design-system/motion";
import { appTheme as theme } from "@/src/design-system/theme";

type IconName = React.ComponentProps<typeof Icon>["name"];

export type IconButtonTone = "neutral" | "cyan" | "green" | "amber" | "red" | "purple";
export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps {
  name: IconName;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  tone?: IconButtonTone;
  size?: IconButtonSize;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
  hapticOnPressIn?: boolean;
  variant?: "plain" | "contained";
}

const SIZE_CONFIG: Record<
  IconButtonSize,
  { target: number; icon: number }
> = {
  sm: { target: 36, icon: 16 },
  md: { target: 44, icon: 20 },
  lg: { target: 52, icon: 24 },
};

const TONE_COLOR: Record<IconButtonTone, string> = {
  neutral: theme.colors.textSecondary,
  cyan: theme.colors.cyan,
  green: theme.colors.green,
  amber: theme.colors.amber,
  red: theme.colors.red,
  purple: theme.colors.purple,
};

const TONE_BG_SOFT: Record<IconButtonTone, string> = {
  neutral: theme.colors.whiteWashFaint,
  cyan: theme.colors.cyanSoft,
  green: theme.colors.greenSoft,
  amber: theme.colors.amberSoft,
  red: theme.colors.redSoft,
  purple: theme.colors.purpleSoft,
};

export function IconButton({
  name,
  onPress,
  onLongPress,
  disabled = false,
  tone = "neutral",
  size = "md",
  style,
  accessibilityLabel,
  hapticOnPressIn = true,
  variant = "plain",
}: IconButtonProps) {
  const pressed = useSharedValue(0);
  const sizeConfig = SIZE_CONFIG[size];
  const iconColor = TONE_COLOR[tone];
  const containedBg = TONE_BG_SOFT[tone];

  const handlePressIn = () => {
    if (disabled || !onPress) return;
    pressed.value = withTiming(1, {
      duration: scaled(appMotion.duration.press),
      easing: appMotion.easing.standard,
    });
    if (hapticOnPressIn) haptics.tap();
  };

  const handlePressOut = () => {
    if (disabled || !onPress) return;
    pressed.value = withSpring(0, appMotion.spring.iconRelease);
  };

  const shellStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          pressed.value,
          [0, 1],
          [1, appMotion.press.icon.scale],
        ),
      },
    ],
  }));

  const tintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pressed.value, [0, 1], [0, 1]),
  }));

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={onPress ? "button" : undefined}
      disabled={disabled || !onPress}
      hitSlop={6}
      onLongPress={onLongPress}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={style}
    >
      <Animated.View
        style={[
          styles.shell,
          {
            width: sizeConfig.target,
            height: sizeConfig.target,
            backgroundColor: variant === "contained" ? containedBg : "transparent",
          },
          disabled && styles.disabled,
          shellStyle,
        ]}
      >
        <Icon color={iconColor} name={name} size={sizeConfig.icon} />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.tint,
            { backgroundColor: theme.feedback.iconPressTint },
            tintStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignItems: "center",
    borderRadius: 999,
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
  },
  disabled: {
    opacity: theme.feedback.disabledOpacity,
  },
});
