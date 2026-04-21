import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import { SignalBars } from "@/components/primitives/SignalBars";
import { appTheme as theme } from "@/src/design-system/theme";
import type { Peer } from "@/src/domain/entities/Peer";

type AnyHref = Parameters<ReturnType<typeof useRouter>["push"]>[0];

interface PeerCardProps {
  peer: Peer;
  onPress: () => void;
}

function relativeTime(lastSeen: number): string {
  const diffMs = Date.now() - lastSeen;
  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 30) return "just now";
  if (diffSecs < 90) return `${diffSecs}s ago`;
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  return `${diffHrs}h ago`;
}

function transportLabel(transport: Peer["transport"]): string {
  switch (transport) {
    case "ble":
      return "BLE";
    case "lxmf":
      return "LXMF";
    case "wifi-direct":
      return "WiFi Direct";
  }
}

function strengthLabel(strength: Peer["signalStrength"]): string {
  switch (strength) {
    case 4:
      return "Strong";
    case 3:
      return "Good";
    case 2:
      return "Weak";
    case 1:
      return "Poor";
    case 0:
      return "None";
  }
}

export function PeerCard({ peer, onPress }: PeerCardProps) {
  const router = useRouter();
  const initial = peer.alias.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      accessibilityLabel={`View ${peer.alias} peer details`}
      accessibilityRole="button"
      activeOpacity={0.75}
      onPress={onPress}
      style={styles.card}
    >
      {/* Identity circle */}
      <View style={styles.avatar}>
        <Text style={styles.avatarInitial}>{initial}</Text>
      </View>

      {/* Main info */}
      <View style={styles.info}>
        <View style={styles.infoRow}>
          <Text style={styles.alias} numberOfLines={1}>
            {peer.alias}
          </Text>
          {peer.isTrusted && (
            <Pill label="Trusted" tone="green" style={styles.trustedPill} />
          )}
        </View>
        <Text style={styles.transport}>{transportLabel(peer.transport)}</Text>
      </View>

      {/* Right side: signal + last seen */}
      <View style={styles.rightBlock}>
        <View style={styles.signalRow}>
          <SignalBars strength={peer.signalStrength} size={14} />
          <Text style={styles.strengthLabel}>{strengthLabel(peer.signalStrength)}</Text>
        </View>
        <Text style={styles.lastSeen}>{relativeTime(peer.lastSeen)}</Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          accessibilityLabel={`Message ${peer.alias}`}
          accessibilityRole="button"
          activeOpacity={0.7}
          hitSlop={8}
          onPress={() => router.push(("/messages/" + peer.id) as AnyHref)}
          style={styles.actionBtn}
        >
          <Icon name="message-circle" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel={`Send to ${peer.alias}`}
          accessibilityRole="button"
          activeOpacity={0.7}
          hitSlop={8}
          onPress={() => router.push((`/send/recipient?to=${encodeURIComponent(peer.publicKey)}`) as AnyHref)}
          style={styles.actionBtn}
        >
          <Icon name="send" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderBottomColor: theme.colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderColor: theme.colors.lineStrong,
    borderRadius: theme.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  avatarInitial: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.bodyLg,
  },
  info: {
    flex: 1,
    gap: theme.spacing.xxs,
  },
  infoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  alias: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
    flexShrink: 1,
  },
  trustedPill: {
    flexShrink: 0,
  },
  transport: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.mono,
    fontSize: theme.type.caption,
    letterSpacing: 0.3,
  },
  rightBlock: {
    alignItems: "flex-end",
    gap: theme.spacing.xxs,
  },
  signalRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  strengthLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
  lastSeen: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.micro,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  actionBtn: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xs,
  },
});
