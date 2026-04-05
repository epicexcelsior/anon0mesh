import React from "react";
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { VP } from "@/constants/void-protocol";

interface VoidButtonProps extends Omit<PressableProps, "children"> {
  /** Button label text */
  label: string;
  /** Visual variant */
  variant?: "primary" | "outline" | "ghost";
  /** Full width (default true) */
  fullWidth?: boolean;
  /** Compact size */
  compact?: boolean;
}

export default function VoidButton({
  label,
  variant = "primary",
  fullWidth = true,
  compact = false,
  disabled,
  style,
  ...rest
}: VoidButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        fullWidth && styles.fullWidth,
        variant === "primary" && styles.primary,
        variant === "outline" && styles.outline,
        variant === "ghost" && styles.ghost,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style as ViewStyle,
      ]}
      disabled={disabled}
      {...rest}
    >
      <Text
        style={[
          styles.label,
          variant === "primary" && styles.labelPrimary,
          variant === "outline" && styles.labelOutline,
          variant === "ghost" && styles.labelGhost,
          disabled && styles.labelDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: VP.radius.sm,
    paddingVertical: 14,
    paddingHorizontal: VP.spacing.lg,
  },
  compact: {
    paddingVertical: 10,
    paddingHorizontal: VP.spacing.md,
  },
  fullWidth: {
    width: "100%",
  },
  primary: {
    backgroundColor: VP.colors.accent.cyan,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: VP.colors.accent.cyan,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk-SemiBold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  labelPrimary: {
    color: VP.colors.text.inverse,
  },
  labelOutline: {
    color: VP.colors.accent.cyan,
  },
  labelGhost: {
    color: VP.colors.accent.cyan,
  },
  labelDisabled: {
    color: VP.colors.text.disabled,
  },
});
