import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import type { PillTone } from "@/components/primitives/Pill";
import * as haptics from "@/src/design-system/haptics";
import * as sound from "@/src/design-system/sound";
import { appTheme as theme } from "@/src/design-system/theme";

type RowTone = "neutral" | "cyan" | "purple" | "amber" | "green";

const TONE_BG: Record<RowTone, string> = {
  neutral: theme.colors.surfaceMuted,
  cyan: theme.colors.cyanSoft,
  purple: theme.colors.purpleSoft,
  amber: theme.colors.amberSoft,
  green: theme.colors.greenSoft,
};

const TONE_FG: Record<RowTone, string> = {
  neutral: theme.colors.textSecondary,
  cyan: theme.colors.cyan,
  purple: theme.colors.purple,
  amber: theme.colors.amber,
  green: theme.colors.green,
};

interface SettingsRowProps {
  label: string;
  sublabel?: string;
  iconName?: string;
  iconTone?: RowTone;
  pillLabel?: string;
  pillTone?: PillTone;
  value?: string;
  onPress?: () => void;
  showSeparator?: boolean;
  right?: React.ReactNode;
}

export function SettingsRow({
  label,
  sublabel,
  iconName,
  iconTone = "neutral",
  pillLabel,
  pillTone = "neutral",
  value,
  onPress,
  showSeparator = true,
  right,
}: SettingsRowProps) {
  function handlePress() {
    if (!onPress) return;
    haptics.tap();
    sound.buttonTap();
    onPress();
  }

  return (
    <TouchableOpacity
      accessibilityLabel={label}
      accessibilityRole={onPress ? "button" : undefined}
      onPress={handlePress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[styles.row, showSeparator && styles.bordered]}
      disabled={!onPress}
    >
      {iconName ? (
        <View style={[styles.iconWrap, { backgroundColor: TONE_BG[iconTone] }]}>
          <Icon
            name={iconName as Parameters<typeof Icon>[0]["name"]}
            size={18}
            color={TONE_FG[iconTone]}
          />
        </View>
      ) : null}

      <View style={styles.mid}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {pillLabel ? <Pill label={pillLabel} tone={pillTone} /> : null}
        </View>
        {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
      </View>

      <View style={styles.rightWrap}>
        {right ?? (
          <>
            {value ? <Text style={styles.value}>{value}</Text> : null}
            {onPress ? <Icon name="chevron-right" size={16} color={theme.colors.textMuted} /> : null}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    minHeight: 68,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  bordered: {
    borderBottomColor: theme.colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    alignItems: "center",
    flexShrink: 0,
    borderRadius: theme.radius.pill,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  mid: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  labelRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.bodyLg,
  },
  sublabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.45,
  },
  rightWrap: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    gap: theme.spacing.xs,
  },
  value: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
});
