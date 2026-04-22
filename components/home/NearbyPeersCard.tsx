import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import type { PillTone } from "@/components/primitives/Pill";
import { PressSurface } from "@/components/primitives/PressSurface";
import { appTheme as theme } from "@/src/design-system/theme";
import { useMesh } from "@/src/hooks/useMesh";
import type { ConnectionState } from "@/src/hooks/useMesh";

const AVATAR_PREVIEW_COUNT = 3;

function stateTone(state: ConnectionState, bleError: string | null | undefined): PillTone {
  if (bleError) return "red";
  switch (state) {
    case "Live": return "green";
    case "Silent": return "amber";
    case "Offline": return "neutral";
  }
}

function initialOf(alias: string | undefined): string {
  if (!alias) return "?";
  return alias.trim().charAt(0).toUpperCase() || "?";
}

function avatarColor(index: number): string {
  const palette = [
    theme.colors.cyanSoft,
    theme.colors.greenSoft,
    theme.colors.purpleSoft,
    theme.colors.amberSoft,
  ];
  return palette[index % palette.length];
}

function avatarTextColor(index: number): string {
  const palette = [
    theme.colors.cyan,
    theme.colors.green,
    theme.colors.purple,
    theme.colors.amber,
  ];
  return palette[index % palette.length];
}

// Small strip above Recent activity — glanceable peer summary + tap
// to open the Peers sheet. Uses the live mesh hook for state; falls
// back to clear "Offline" copy when BLE is disabled or permissions
// aren't granted.
export function NearbyPeersCard() {
  const router = useRouter();
  const { peers, nodeCount, connectionState, bleError } = useMesh();

  const previewPeers = peers.slice(0, AVATAR_PREVIEW_COUNT);
  const extraCount = Math.max(0, nodeCount - AVATAR_PREVIEW_COUNT);
  const label = bleError
    ? "BLE unavailable"
    : `${nodeCount} ${nodeCount === 1 ? "peer" : "peers"} nearby`;

  return (
    <PressSurface
      accessibilityLabel="Open peers sheet"
      onPress={() => router.push("/peers" as Parameters<typeof router.push>[0])}
      style={styles.card}
      variant="card"
    >
      <View style={styles.inner}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{label}</Text>
          <Pill
            label={bleError ? "BLE error" : connectionState}
            tone={stateTone(connectionState, bleError)}
          />
        </View>

        <View style={styles.rightBlock}>
          {previewPeers.length > 0 ? (
            <View style={styles.avatarStack}>
              {previewPeers.map((peer, index) => (
                <View
                  key={peer.id}
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: avatarColor(index),
                      marginLeft: index === 0 ? 0 : -8,
                    },
                  ]}
                >
                  <Text style={[styles.avatarText, { color: avatarTextColor(index) }]}>
                    {initialOf(peer.alias)}
                  </Text>
                </View>
              ))}
              {extraCount > 0 ? (
                <View style={[styles.avatar, styles.avatarExtra]}>
                  <Text style={styles.avatarExtraText}>+{extraCount}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
          <Icon color={theme.colors.textMuted} name="chevron-right" size={16} />
        </View>
      </View>
    </PressSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    marginHorizontal: theme.spacing.lg,
  },
  inner: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  titleBlock: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  title: {
    color: theme.colors.textPrimary,
    flexShrink: 1,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
  },
  rightBlock: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  avatarStack: {
    flexDirection: "row",
  },
  avatar: {
    alignItems: "center",
    borderColor: theme.colors.background,
    borderRadius: theme.radius.pill,
    borderWidth: 2,
    height: 26,
    justifyContent: "center",
    width: 26,
  },
  avatarText: {
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.micro,
  },
  avatarExtra: {
    backgroundColor: theme.colors.surfaceMuted,
    marginLeft: -8,
  },
  avatarExtraText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
  },
});
