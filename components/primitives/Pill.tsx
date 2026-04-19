import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { appTheme as theme } from "@/src/design-system/theme";

export type PillTone = "cyan" | "green" | "amber" | "red" | "purple" | "neutral";

interface PillProps {
  label: string;
  tone?: PillTone;
  style?: StyleProp<ViewStyle>;
}

const TONE_BG: Record<PillTone, string> = {
  cyan: theme.colors.cyanSoft,
  green: theme.colors.greenSoft,
  amber: theme.colors.amberSoft,
  red: theme.colors.redSoft,
  purple: theme.colors.purpleSoft,
  neutral: "rgba(255,255,255,0.06)",
};

const TONE_BORDER: Record<PillTone, string> = {
  cyan: "rgba(0, 218, 243, 0.18)",
  green: "rgba(60, 227, 106, 0.20)",
  amber: "rgba(255, 191, 0, 0.20)",
  red: "rgba(204, 102, 102, 0.22)",
  purple: "rgba(139, 95, 191, 0.24)",
  neutral: "rgba(255,255,255,0.08)",
};

const TONE_FG: Record<PillTone, string> = {
  cyan: theme.colors.cyan,
  green: theme.colors.green,
  amber: theme.colors.amber,
  red: theme.colors.red,
  purple: theme.colors.purple,
  neutral: theme.colors.textSecondary,
};

export function Pill({ label, tone = "neutral", style }: PillProps) {
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: TONE_BG[tone], borderColor: TONE_BORDER[tone] },
        style,
      ]}
    >
      <Text style={[styles.label, { color: TONE_FG[tone] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: "center",
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
  },
  label: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.2,
  },
});
