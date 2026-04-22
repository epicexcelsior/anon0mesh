import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import { PressSurface } from "@/components/primitives/PressSurface";
import { SignalBars } from "@/components/primitives/SignalBars";
import { appTheme as theme } from "@/src/design-system/theme";
import type { Peer } from "@/src/domain/entities/Peer";

function shortAddress(address: string) {
  if (address.length <= 14) return address;
  return `${address.slice(0, 8)}…${address.slice(-4)}`;
}

function transportLabel(transport: Peer["transport"]) {
  switch (transport) {
    case "ble":
      return "BLE";
    case "wifi-direct":
      return "Wi-Fi";
    case "lxmf":
      return "LXMF";
    default:
      return transport;
  }
}

interface MessagePeerRowProps {
  onPress: () => void;
  peer: Peer;
}

export function MessagePeerRow({ onPress, peer }: MessagePeerRowProps) {
  return (
    <PressSurface
      accessibilityLabel={`Start conversation with ${peer.alias}`}
      onPress={onPress}
      style={styles.row}
      variant="row"
    >
      <View style={styles.inner}>
        <View style={styles.identityBlock}>
          <View style={styles.avatar}>
            <Icon color={theme.colors.cyan} name="user" size={16} />
          </View>

          <View style={styles.copy}>
            <View style={styles.titleRow}>
              <Text numberOfLines={1} style={styles.alias}>
                {peer.alias}
              </Text>
              {peer.isTrusted ? <Pill label="Trusted" tone="green" /> : null}
            </View>
            <Text numberOfLines={1} style={styles.address}>
              {shortAddress(peer.publicKey)}
            </Text>
          </View>
        </View>

        <View style={styles.meta}>
          <SignalBars strength={peer.signalStrength} />
          <Text style={styles.transport}>{transportLabel(peer.transport)}</Text>
        </View>
      </View>
    </PressSurface>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
  },
  inner: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 76,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
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
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  titleRow: {
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
  transport: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.45,
    textTransform: "uppercase",
  },
});
