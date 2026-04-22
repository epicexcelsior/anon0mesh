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

// Vertical-stacked tile — icon on top, title centered, body centered.
// Lives inside a horizontal row of equal-width tiles on Welcome, so
// all icons line up at the same Y position regardless of text length.
export function FeatureHighlight({ iconName, title, body }: FeatureHighlightProps) {
  return (
    <View style={styles.tile}>
      <View style={styles.iconWrap}>
        <Icon name={iconName} size={24} color={theme.colors.cyan} />
      </View>
      <Text numberOfLines={2} style={styles.title}>
        {title}
      </Text>
      <Text numberOfLines={3} style={styles.body}>
        {body}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: "center",
    flex: 1,
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: theme.colors.cyanSoft,
    borderRadius: theme.radius.md,
    height: 56,
    justifyContent: "center",
    marginBottom: theme.spacing.xs,
    width: 56,
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.body,
    textAlign: "center",
  },
  body: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: 18,
    textAlign: "center",
  },
});
