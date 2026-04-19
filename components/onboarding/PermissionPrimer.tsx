import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { appTheme as theme } from "@/src/design-system/theme";

interface PermissionPrimerProps {
  iconName: string;
  title: string;
  reason: string;
}

export function PermissionPrimer({ iconName, title, reason }: PermissionPrimerProps) {
  return (
    <GlassSurface variant="soft" style={styles.card}>
      <View style={styles.row}>
        <Icon name={iconName as any} size={18} color={theme.colors.textSecondary} />
        <View style={styles.text}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.reason}>{reason}</Text>
        </View>
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing.md,
    alignItems: "flex-start",
  },
  text: { flex: 1, gap: theme.spacing.xxs },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  reason: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: 17,
  },
});
