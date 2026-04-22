import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/primitives/Icon";
import { appTheme as theme } from "@/src/design-system/theme";

type IconName = React.ComponentProps<typeof Icon>["name"];

interface FeatureHighlightProps {
  iconName: IconName;
  title: string;
  body: string;
}

export function FeatureHighlight({ iconName, title, body }: FeatureHighlightProps) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Icon name={iconName} size={22} color={theme.colors.cyan} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: theme.colors.cyanSoft,
    borderRadius: theme.radius.md,
    flexShrink: 0,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  text: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.section,
  },
  body: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.bodyLg,
    lineHeight: 22,
  },
});
