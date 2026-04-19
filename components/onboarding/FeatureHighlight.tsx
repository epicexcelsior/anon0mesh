import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { appTheme as theme } from "@/src/design-system/theme";

interface FeatureHighlightProps {
  iconName: string;
  title: string;
  body: string;
}

export function FeatureHighlight({ iconName, title, body }: FeatureHighlightProps) {
  return (
    <GlassSurface variant="soft" style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Icon name={iconName as any} size={20} color={theme.colors.cyan} />
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
        </View>
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing.lg,
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.cyanSoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  text: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.body,
  },
  body: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: 18,
  },
});
