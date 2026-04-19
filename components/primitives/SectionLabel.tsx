import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { appTheme as theme } from "@/src/design-system/theme";

interface SectionLabelProps {
  label: string;
  trailing?: React.ReactNode;
}

export function SectionLabel({ label, trailing }: SectionLabelProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.xs,
  },
  label: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
    letterSpacing: 0.45,
    textTransform: "uppercase",
  },
});
