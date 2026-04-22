import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/primitives/Icon";
import { appTheme as theme } from "@/src/design-system/theme";

interface PermissionPrimerProps {
  iconName: string;
  title: string;
  reason: string;
}

// Slim inline row — secondary info, not a primary card.
export function PermissionPrimer({ iconName, title, reason }: PermissionPrimerProps) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Icon name={iconName as any} size={16} color={theme.colors.textSecondary} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.reason}>{reason}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: theme.colors.whiteWashFaint,
    borderRadius: theme.radius.sm,
    height: 32,
    justifyContent: "center",
    marginTop: 1,
    width: 32,
  },
  text: { flex: 1, gap: 2 },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  reason: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: 18,
  },
});
