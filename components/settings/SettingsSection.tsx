import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { GlassSurface } from "@/components/primitives/GlassSurface";
import { SectionLabel } from "@/components/primitives/SectionLabel";
import { appTheme as theme } from "@/src/design-system/theme";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <SectionLabel label={title} />
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <GlassSurface variant="regular" style={styles.card}>
        {children}
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: theme.spacing.sm,
  },
  header: {
    gap: theme.spacing.xs,
  },
  description: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.55,
  },
  card: {
    borderRadius: theme.radius.xl,
    overflow: "hidden",
  },
});
