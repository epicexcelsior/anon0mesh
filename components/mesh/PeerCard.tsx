import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import { PressSurface } from "@/components/primitives/PressSurface";
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
      return "Wi-Fi Direct";
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

function shortAddress(address: string): string {
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-4)}`;
}

export function PeerCard({ peer, onPress }: PeerCardProps) {
  const router = useRouter();

  return (
    <PressSurface
      accessibilityLabel={`View ${peer.alias} peer details`}
      onPress={onPress}
      style={styles.touchable}
      variant="card"
    >
      <GlassSurface style={styles.card} variant="strong">
        <View style={styles.topRow}>
          <View style={styles.identityBlock}>
            <View style={styles.avatar}>
              <Icon
                color={peer.isTrusted ? theme.colors.green : theme.colors.cyan}
                name="mesh-nodes"
                size={18}
              />
            </View>

            <View style={styles.info}>
              <View style={styles.infoRow}>
                <Text style={styles.alias} numberOfLines={1}>
                  {peer.alias}
                </Text>
                <Pill
                  label={peer.isTrusted ? "Trusted" : "Unverified"}
                  tone={peer.isTrusted ? "green" : "amber"}
                  style={styles.statusPill}
                />
              </View>
              <Text numberOfLines={1} style={styles.address}>
                {shortAddress(peer.publicKey)}
              </Text>
            </View>
          </View>

          <View style={styles.rightBlock}>
            <SignalBars strength={peer.signalStrength} size={14} />
            <Text style={styles.lastSeen}>{relativeTime(peer.lastSeen)}</Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.metaRow}>
            <Pill label={transportLabel(peer.transport)} tone="neutral" />
            <Text style={styles.strengthLabel}>
              {strengthLabel(peer.signalStrength)} signal
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              accessibilityLabel={`Message ${peer.alias}`}
              accessibilityRole="button"
              activeOpacity={0.7}
              hitSlop={8}
              onPress={() => router.push(("/messages/" + peer.id) as AnyHref)}
              style={styles.actionBtn}
            >
              <Icon name="message-circle" size={18} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel={`Send to ${peer.alias}`}
              accessibilityRole="button"
              activeOpacity={0.7}
              hitSlop={8}
              onPress={() =>
                router.push(
                  (`/send/recipient?to=${encodeURIComponent(peer.publicKey)}`) as AnyHref,
                )
              }
              style={styles.actionBtn}
            >
              <Icon name="send" size={18} color={theme.colors.cyan} />
            </TouchableOpacity>
            <View style={styles.chevron}>
              <Icon name="chevron-right" size={16} color={theme.colors.textMuted} />
            </View>
          </View>
        </View>
      </GlassSurface>
    </PressSurface>
  );
}

const styles = StyleSheet.create({
  touchable: {
    width: "100%",
    borderRadius: theme.radius.xl,
  },
  card: {
    borderRadius: theme.radius.xl,
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  identityBlock: {
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
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  info: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  infoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  alias: {
    color: theme.colors.textPrimary,
    flexShrink: 1,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.bodyLg,
  },
  statusPill: {
    flexShrink: 0,
  },
  address: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: theme.type.caption,
  },
  rightBlock: {
    alignItems: "flex-end",
    gap: theme.spacing.xs,
    marginLeft: theme.spacing.md,
  },
  lastSeen: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.micro,
  },
  bottomRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
  },
  metaRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  strengthLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  actionBtn: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  chevron: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 20,
  },
});
