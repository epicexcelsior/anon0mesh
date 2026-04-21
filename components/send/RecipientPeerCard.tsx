import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Icon } from "@/components/primitives/Icon";
import { SignalBars } from "@/components/primitives/SignalBars";
import { appTheme as theme } from "@/src/design-system/theme";
import type { Peer } from "@/src/domain/entities/Peer";

function shortAddress(addr: string): string {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-4)}`;
}

function formatTransportLabel(transport: Peer["transport"]) {
  switch (transport) {
    case "ble":
      return "BLE mesh";
    case "wifi-direct":
      return "Wi-Fi Direct";
    case "lxmf":
      return "LXMF";
    default:
      return transport;
  }
}

interface RecipientPeerCardProps {
  onPress: () => void;
  peer: Peer;
  selected: boolean;
}

export function RecipientPeerCard({
  onPress,
  peer,
  selected,
}: RecipientPeerCardProps) {
  return (
    <TouchableOpacity
      accessibilityLabel={`Select ${peer.alias}`}
      accessibilityRole="button"
      activeOpacity={0.82}
      onPress={onPress}
      style={[styles.peerCard, selected && styles.peerCardSelected]}
    >
      <View style={styles.peerIdentity}>
        <View style={[styles.peerAvatar, selected && styles.peerAvatarSelected]}>
          <Icon
            color={selected ? theme.colors.textOnAccent : theme.colors.cyan}
            name="user"
            size={16}
          />
        </View>

        <View style={styles.peerCopy}>
          <Text numberOfLines={1} style={styles.peerAlias}>
            {peer.alias}
          </Text>
          <Text numberOfLines={1} style={styles.peerAddress}>
            {shortAddress(peer.publicKey)}
          </Text>
        </View>
      </View>

      <View style={styles.peerMeta}>
        <View style={styles.peerSignalRow}>
          <SignalBars
            activeColor={selected ? theme.colors.textOnAccent : theme.colors.cyan}
            inactiveColor={selected ? "rgba(5, 10, 10, 0.18)" : theme.colors.surfaceContainerHigh}
            strength={peer.signalStrength}
          />
          <Text style={[styles.peerTransport, selected && styles.peerTransportSelected]}>
            {formatTransportLabel(peer.transport)}
          </Text>
        </View>

        {selected ? (
          <Icon color={theme.colors.textOnAccent} name="check" size={14} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  peerCard: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 74,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  peerCardSelected: {
    backgroundColor: theme.colors.cyan,
    borderColor: theme.colors.cyan,
  },
  peerIdentity: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    minWidth: 0,
  },
  peerAvatar: {
    alignItems: "center",
    backgroundColor: theme.colors.cyanSoft,
    borderRadius: theme.radius.pill,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  peerAvatarSelected: {
    backgroundColor: "rgba(5, 10, 10, 0.14)",
  },
  peerCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  peerAlias: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.bodyLg,
  },
  peerAddress: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: theme.type.caption,
  },
  peerMeta: {
    alignItems: "flex-end",
    gap: theme.spacing.xs,
    marginLeft: theme.spacing.md,
  },
  peerSignalRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  peerTransport: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  peerTransportSelected: {
    color: "rgba(5, 10, 10, 0.72)",
  },
});
