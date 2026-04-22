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
  neutral: theme.colors.surfaceContainerLowest,
};

const TONE_BORDER: Record<PillTone, string> = {
  cyan: theme.colors.cyanBorderSoft,
  green: theme.colors.greenBorderSoft,
  amber: theme.colors.amberBorderSoft,
  red: theme.colors.redBorderSoft,
  purple: theme.colors.purpleBorderSoft,
  neutral: theme.colors.line,
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
    minHeight: theme.component.rows.statePill.minHeight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
  },
  label: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});
