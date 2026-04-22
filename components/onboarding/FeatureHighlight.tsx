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

// Horizontal row — icon tile on the left (top-aligned so icons line up
// across rows regardless of text length), title + body on the right.
export function FeatureHighlight({ iconName, title, body }: FeatureHighlightProps) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Icon name={iconName} size={24} color={theme.colors.cyan} />
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
    paddingTop: 4,
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
