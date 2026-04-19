import React from "react";
import { StyleSheet, View } from "react-native";

import { GlassSurface } from "@/components/primitives/GlassSurface";
import { SectionLabel } from "@/components/primitives/SectionLabel";
import { appTheme as theme } from "@/src/design-system/theme";

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View style={styles.section}>
      <SectionLabel label={title} />
      <GlassSurface variant="regular" style={styles.card}>
        {children}
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: theme.spacing.xs,
    marginHorizontal: theme.spacing.lg,
  },
  card: {
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },
});
