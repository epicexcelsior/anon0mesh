import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Icon } from "@/components/primitives/Icon";
import { PressSurface } from "@/components/primitives/PressSurface";
import { appTheme as theme } from "@/src/design-system/theme";

type IconName = React.ComponentProps<typeof Icon>["name"];
type RouteHref = Parameters<ReturnType<typeof useRouter>["push"]>[0];

interface ActionDef {
  id: "send" | "receive" | "swap";
  label: string;
  icon: IconName;
  tone: "primary" | "neutral" | "pending";
  route?: RouteHref;
  disabled?: boolean;
  badge?: string;
}

const ACTIONS: ActionDef[] = [
  { id: "send", label: "Send", icon: "arrow-up-right", tone: "primary", route: "/send/recipient" },
  { id: "receive", label: "Receive", icon: "arrow-down-left", tone: "neutral", route: "/receive" },
  { id: "swap", label: "Swap", icon: "refresh-cw", tone: "pending", disabled: true, badge: "Soon" },
];

function iconColor(tone: ActionDef["tone"]): string {
  switch (tone) {
    case "primary": return theme.colors.textOnAccent;
    case "neutral": return theme.colors.cyan;
    case "pending": return theme.colors.amber;
  }
}

function tileBackground(tone: ActionDef["tone"]): string {
  switch (tone) {
    case "primary": return theme.colors.cyan;
    case "neutral": return theme.colors.surfaceContainerLowest;
    case "pending": return theme.colors.amberSoft;
  }
}

function tileBorder(tone: ActionDef["tone"]): string {
  switch (tone) {
    case "primary": return theme.colors.cyanBorderStrong;
    case "neutral": return theme.colors.line;
    case "pending": return theme.colors.amberBorderSoft;
  }
}

// Three primary wallet actions: Send (cyan filled), Receive (neutral
// outlined), Swap (amber placeholder, disabled with Soon badge).
// Circular icon tiles with labels below — matches the pattern from
// Base / Revolut / Phantom while staying inside our dark theme.
export function ActionRow() {
  const router = useRouter();

  return (
    <View style={styles.row}>
      {ACTIONS.map((action) => {
        const onPress = action.disabled || !action.route
          ? undefined
          : () => router.push(action.route as RouteHref);

        return (
          <PressSurface
            accessibilityLabel={action.disabled ? `${action.label} — coming soon` : action.label}
            disabled={action.disabled}
            key={action.id}
            onPress={onPress}
            style={styles.cell}
            variant="card"
          >
            <View style={styles.inner}>
              <View
                style={[
                  styles.iconTile,
                  {
                    backgroundColor: tileBackground(action.tone),
                    borderColor: tileBorder(action.tone),
                  },
                ]}
              >
                <Icon color={iconColor(action.tone)} name={action.icon} size={22} />
              </View>
              <Text style={[styles.label, action.disabled && styles.labelDisabled]}>
                {action.label}
              </Text>
              {action.badge ? <Text style={styles.badge}>{action.badge}</Text> : null}
            </View>
          </PressSurface>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  cell: {
    flex: 1,
    borderRadius: theme.radius.lg,
  },
  inner: {
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
  },
  iconTile: {
    alignItems: "center",
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  label: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
  },
  labelDisabled: {
    color: theme.colors.textMuted,
  },
  badge: {
    color: theme.colors.amber,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});
