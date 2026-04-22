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

// Horizontal row — icon tile on the left, title + body on the right.
// Row has a fixed min-height so stacked rows align visually even when
// their body text lengths differ. Icon tile is center-aligned within
// the row so short-body rows don't drift the icon upward.
const ROW_MIN_HEIGHT = 64;

export function FeatureHighlight({ iconName, title, body }: FeatureHighlightProps) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Icon name={iconName} size={24} color={theme.colors.cyan} />
      </View>
      <View style={styles.text}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <Text numberOfLines={2} style={styles.body}>
          {body}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.lg,
    minHeight: ROW_MIN_HEIGHT,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: theme.colors.cyanSoft,
    borderRadius: theme.radius.md,
    flexShrink: 0,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.headingBold,
    fontSize: 18,
  },
  body: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    lineHeight: 21,
  },
});
