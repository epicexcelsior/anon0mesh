import React from "react";
import {
  Alert,
  Clipboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { DepthButton } from "@/components/primitives/DepthButton";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import { SignalBars } from "@/components/primitives/SignalBars";
import { appTheme as theme } from "@/src/design-system/theme";
import type { Peer } from "@/src/domain/entities/Peer";

type AnyHref = Parameters<ReturnType<typeof useRouter>["push"]>[0];

interface PeerDetailProps {
  peer: Peer;
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

function transportIconName(transport: Peer["transport"]) {
  switch (transport) {
    case "ble":
      return "bluetooth" as const;
    case "lxmf":
      return "radio" as const;
    case "wifi-direct":
      return "wifi" as const;
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

function StatRow({
  iconName,
  label,
  value,
  valueNode,
}: {
  iconName: "bluetooth" | "radio" | "wifi" | "activity" | "clock" | "shield";
  label: string;
  value?: string;
  valueNode?: React.ReactNode;
}) {
  return (
    <View style={styles.statRow}>
      <Icon name={iconName} size={16} color={theme.colors.textMuted} />
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValueWrap}>
        {valueNode ?? <Text style={styles.statValue}>{value}</Text>}
      </View>
    </View>
  );
}

export function PeerDetail({ peer }: PeerDetailProps) {
  const router = useRouter();
  const initial = peer.alias.charAt(0).toUpperCase();

  function handleCopyKey() {
    Clipboard.setString(peer.publicKey);
    Alert.alert("Copied", "Public key copied to clipboard.");
  }

  return (
    <View style={styles.container}>
      {/* Identity section */}
      <View style={styles.identitySection}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
        <Text style={styles.aliasTitle}>{peer.alias}</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleCopyKey}
          style={styles.pubKeyRow}
        >
          <Text style={styles.pubKey} numberOfLines={1} ellipsizeMode="middle">
            {peer.publicKey}
          </Text>
          <Icon name="copy" size={14} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Stats card */}
      <GlassSurface variant="soft" style={styles.statsCard}>
        <StatRow
          iconName={transportIconName(peer.transport)}
          label="Transport"
          value={transportLabel(peer.transport)}
        />
        <View style={styles.divider} />
        <StatRow
          iconName="activity"
          label="Signal"
          valueNode={
            <View style={styles.signalValueRow}>
              <SignalBars strength={peer.signalStrength} size={14} />
              <Text style={styles.statValue}>
                {strengthLabel(peer.signalStrength)}
              </Text>
            </View>
          }
        />
        <View style={styles.divider} />
        <StatRow
          iconName="clock"
          label="Last seen"
          value={relativeTime(peer.lastSeen)}
        />
        {peer.isTrusted && (
          <>
            <View style={styles.divider} />
            <StatRow
              iconName="shield"
              label="Trust"
              valueNode={<Pill label="Trusted" tone="green" />}
            />
          </>
        )}
      </GlassSurface>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <DepthButton
          variant="secondary"
          size="md"
          icon={<Icon name="message-circle" size={18} color={theme.colors.textPrimary} />}
          label="Message"
          onPress={() => router.push(("/messages/" + peer.id) as AnyHref)}
          style={styles.actionBtn}
        />
        <DepthButton
          variant="primary"
          tone="cyan"
          size="md"
          icon={<Icon name="send" size={18} color={theme.colors.textOnAccent} />}
          label="Send Payment"
          onPress={() => router.push(("/send/recipient?to=" + peer.id) as AnyHref)}
          style={styles.actionBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
  },
  identitySection: {
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  avatarLarge: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderColor: theme.colors.lineStrong,
    borderRadius: theme.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    height: 80,
    justifyContent: "center",
    width: 80,
  },
  avatarInitial: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.title,
  },
  aliasTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.section,
    marginTop: theme.spacing.xs,
  },
  pubKeyRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
    maxWidth: 260,
  },
  pubKey: {
    color: theme.colors.textMuted,
    flex: 1,
    fontFamily: theme.fonts.mono,
    fontSize: theme.type.micro,
    letterSpacing: 0.3,
  },
  statsCard: {
    borderRadius: theme.radius.md,
    overflow: "hidden",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  statRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  statLabel: {
    color: theme.colors.textMuted,
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
  },
  statValueWrap: {
    alignItems: "flex-end",
  },
  statValue: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  signalValueRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  divider: {
    backgroundColor: theme.colors.line,
    height: StyleSheet.hairlineWidth,
  },
  actionsRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
});
