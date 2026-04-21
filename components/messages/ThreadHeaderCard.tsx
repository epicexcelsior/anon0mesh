import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import { SignalBars } from "@/components/primitives/SignalBars";
import { appTheme as theme } from "@/src/design-system/theme";
import type { Peer } from "@/src/domain/entities/Peer";

function shortAddress(address?: string) {
  if (!address) return "No peer selected";
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}…${address.slice(-4)}`;
}

function transportLabel(transport?: Peer["transport"]) {
  switch (transport) {
    case "ble":
      return "BLE";
    case "wifi-direct":
      return "Wi-Fi";
    case "lxmf":
      return "LXMF";
    default:
      return "Peer";
  }
}

function relativeLastSeen(lastSeen?: number) {
  if (!lastSeen) return "just now";
  const diff = Date.now() - lastSeen;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

interface ThreadHeaderCardProps {
  peer?: Peer;
  title: string;
}

export function ThreadHeaderCard({ peer, title }: ThreadHeaderCardProps) {
  return (
    <GlassSurface style={styles.card} variant="strong">
      <View style={styles.topRow}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Icon color={theme.colors.cyan} name="lock" size={16} />
          </View>

          <View style={styles.copy}>
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>
            <Text numberOfLines={1} style={styles.address}>
              {shortAddress(peer?.publicKey)}
            </Text>
          </View>
        </View>

        <View style={styles.meta}>
          {peer ? <SignalBars strength={peer.signalStrength} /> : null}
          <Pill label={transportLabel(peer?.transport)} tone="neutral" />
        </View>
      </View>

      <View style={styles.badges}>
        <Pill label={peer?.isTrusted ? "Trusted peer" : "Unverified peer"} tone={peer?.isTrusted ? "green" : "amber"} />
        <Text style={styles.detail}>
          {peer ? `Last seen ${relativeLastSeen(peer.lastSeen)}` : "Peer link pending"}
        </Text>
      </View>

      <Text style={styles.note}>
        Threads are fixture-backed in this recovery build while the LXMF runtime lands.
      </Text>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.xl,
    gap: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  identity: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    minWidth: 0,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: theme.colors.cyanSoft,
    borderRadius: theme.radius.pill,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.bodyLg,
  },
  address: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: theme.type.caption,
  },
  meta: {
    alignItems: "flex-end",
    gap: theme.spacing.xs,
    marginLeft: theme.spacing.md,
  },
  badges: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  detail: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
  note: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.6,
  },
});
