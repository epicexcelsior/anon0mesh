import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Icon } from "@/components/primitives/Icon";
import { appTheme as theme } from "@/src/design-system/theme";

interface SettingsRowProps {
  label: string;
  sublabel?: string;
  iconName?: string;
  value?: string;
  onPress?: () => void;
  showSeparator?: boolean;
  right?: React.ReactNode;
}

export function SettingsRow({
  label,
  sublabel,
  iconName,
  value,
  onPress,
  showSeparator = true,
  right,
}: SettingsRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[styles.row, showSeparator && styles.bordered]}
      disabled={!onPress}
    >
      {iconName ? (
        <View style={styles.iconWrap}>
          <Icon
            name={iconName as Parameters<typeof Icon>[0]["name"]}
            size={18}
            color={theme.colors.textSecondary}
          />
        </View>
      ) : null}

      <View style={styles.mid}>
        <Text style={styles.label}>{label}</Text>
        {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
      </View>

      <View style={styles.rightWrap}>
        {right ?? (
          <>
            {value ? <Text style={styles.value}>{value}</Text> : null}
            <Icon name="chevron-right" size={16} color={theme.colors.textMuted} />
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
    gap: theme.spacing.sm,
    minHeight: 52,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  bordered: {
    borderBottomColor: theme.colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    alignItems: "center",
    flexShrink: 0,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  mid: {
    flex: 1,
    gap: theme.spacing.xxs,
  },
  label: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
  },
  sublabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
  rightWrap: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    gap: theme.spacing.xs,
  },
  value: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
  },
});
