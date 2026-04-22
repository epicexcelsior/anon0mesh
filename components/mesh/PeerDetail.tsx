import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";

import { DepthButton } from "@/components/primitives/DepthButton";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import { SignalBars } from "@/components/primitives/SignalBars";
import * as haptics from "@/src/design-system/haptics";
import { appTheme as theme } from "@/src/design-system/theme";
import type { Peer } from "@/src/domain/entities/Peer";

type AnyHref = Parameters<ReturnType<typeof useRouter>["push"]>[0];

interface PeerDetailProps {
  onBlock?: () => Promise<void> | void;
  onTrust?: () => Promise<void> | void;
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
      return "Wi-Fi Direct";
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

function shortAddress(address: string): string {
  if (address.length <= 18) return address;
  return `${address.slice(0, 10)}...${address.slice(-4)}`;
}

function StatRow({
  icon,
  label,
  value,
  valueNode,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  valueNode?: React.ReactNode;
}) {
  return (
    <View style={styles.statRow}>
      {icon}
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValueWrap}>
        {valueNode ?? <Text style={styles.statValue}>{value}</Text>}
      </View>
    </View>
  );
}

export function PeerDetail({ peer, onTrust, onBlock }: PeerDetailProps) {
  const router = useRouter();

  async function handleCopyKey() {
    haptics.tap();
    await Clipboard.setStringAsync(peer.publicKey);
    Alert.alert("Copied", "Public key copied to clipboard.");
  }

  async function handleTrust() {
    if (!onTrust || peer.isTrusted) return;
    await onTrust();
  }

  function handleBlock() {
    if (!onBlock) return;
    Alert.alert(
      "Block peer?",
      "This removes the peer from the current graph until it is discovered again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: () => {
            void onBlock();
          },
        },
      ],
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <GlassSurface variant="strong" style={styles.heroCard}>
        <View style={styles.heroTraceRow}>
          <View style={styles.heroTraceDot} />
          <View style={styles.heroTraceLine} />
        </View>

        <View style={styles.heroTop}>
          <View style={styles.avatarLarge}>
            <Icon
              color={peer.isTrusted ? theme.colors.green : theme.colors.cyan}
              name="mesh-nodes"
              size={28}
            />
          </View>

          <View style={styles.heroCopy}>
            <Text style={styles.aliasTitle}>{peer.alias}</Text>
            <Text style={styles.pubKeyLabel}>Mesh identity</Text>
            <Text numberOfLines={1} style={styles.pubKey}>
              {shortAddress(peer.publicKey)}
            </Text>
          </View>

          <View style={styles.heroMeta}>
            <SignalBars strength={peer.signalStrength} size={16} />
            <Pill label={transportLabel(peer.transport)} tone="neutral" />
          </View>
        </View>

        <View style={styles.badgeRow}>
          <Pill
            label={peer.isTrusted ? "Trusted peer" : "Unverified peer"}
            tone={peer.isTrusted ? "green" : "amber"}
          />
          <Text style={styles.lastSeenText}>Last seen {relativeTime(peer.lastSeen)}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.78}
          onPress={handleCopyKey}
          style={styles.copyButton}
        >
          <Text style={styles.copyButtonText}>Copy full public key</Text>
          <Icon name="copy" size={14} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <Text style={styles.heroNote}>
          Peer discovery is live here. Detail cards below stay honest to the current runtime:
          trust, signal, and direct-route context are real, while deeper relay metrics are
          still staged.
        </Text>
      </GlassSurface>

      <Text style={styles.sectionLabel}>Connection</Text>
      <GlassSurface variant="soft" style={styles.statsCard}>
        <StatRow
          icon={
            <Icon
              name={transportIconName(peer.transport)}
              size={16}
              color={theme.colors.textMuted}
            />
          }
          label="Transport"
          value={transportLabel(peer.transport)}
        />
        <View style={styles.divider} />
        <StatRow
          icon={<Icon name="activity" size={16} color={theme.colors.textMuted} />}
          label="Signal"
          valueNode={
            <View style={styles.signalValueRow}>
              <SignalBars strength={peer.signalStrength} size={14} />
              <Text style={styles.statValue}>{strengthLabel(peer.signalStrength)}</Text>
            </View>
          }
        />
        <View style={styles.divider} />
        <StatRow
          icon={<Icon name="clock" size={16} color={theme.colors.textMuted} />}
          label="Last seen"
          value={relativeTime(peer.lastSeen)}
        />
        <View style={styles.divider} />
        <StatRow
          icon={<Icon name="shield" size={16} color={theme.colors.textMuted} />}
          label="Trust state"
          valueNode={
            <Pill
              label={peer.isTrusted ? "Trusted" : "Unverified"}
              tone={peer.isTrusted ? "green" : "amber"}
            />
          }
        />
      </GlassSurface>

      <Text style={styles.sectionLabel}>Runtime notes</Text>
      <GlassSurface variant="soft" style={styles.statsCard}>
        <StatRow
          icon={<Icon name="share-2" size={16} color={theme.colors.textMuted} />}
          label="Route path"
          value="Direct peer"
        />
        <View style={styles.divider} />
        <StatRow
          icon={<Icon name="radio" size={16} color={theme.colors.textMuted} />}
          label="Relay handoff"
          value="Not active on this branch"
        />
        <View style={styles.divider} />
        <StatRow
          icon={<Icon name="map-pin" size={16} color={theme.colors.textMuted} />}
          label="Latency / distance"
          value="Not exposed yet"
        />
        <View style={styles.divider} />
        <StatRow
          icon={<Icon name="beacon" size={16} color={theme.colors.textMuted} />}
          label="Beacon stake"
          value="Placeholder only"
        />
      </GlassSurface>

      <View style={styles.actionsRow}>
        <DepthButton
          variant="secondary"
          size="md"
          icon={
            <Icon name="message-circle" size={18} color={theme.colors.textPrimary} />
          }
          label="Message"
          onPress={() => router.push(("/messages/" + peer.id) as AnyHref)}
          style={styles.actionBtn}
        />
        <DepthButton
          variant="primary"
          tone="cyan"
          size="md"
          icon={<Icon name="send" size={18} color={theme.colors.textOnAccent} />}
          label="Send payment"
          onPress={() =>
            router.push(
              (`/send/recipient?to=${encodeURIComponent(peer.publicKey)}`) as AnyHref,
            )
          }
          style={styles.actionBtn}
        />
      </View>

      <View style={styles.secondaryActionsRow}>
        {!peer.isTrusted ? (
          <DepthButton
            variant="success"
            size="md"
            icon={<Icon name="shield" size={18} color={theme.colors.textOnAccent} />}
            label="Trust peer"
            onPress={handleTrust}
            style={styles.actionBtn}
          />
        ) : null}
        <DepthButton
          variant="danger"
          size="md"
          icon={<Icon name="slash" size={18} color={theme.colors.red} />}
          label="Block"
          onPress={handleBlock}
          style={styles.actionBtn}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  heroCard: {
    borderRadius: theme.radius.xl,
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  heroTraceRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  heroTraceDot: {
    backgroundColor: theme.colors.cyan,
    borderRadius: theme.radius.pill,
    height: 8,
    width: 8,
  },
  heroTraceLine: {
    backgroundColor: theme.colors.cyanGlow,
    borderRadius: theme.radius.pill,
    height: 1,
    width: 88,
  },
  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  avatarLarge: {
    alignItems: "center",
    backgroundColor: theme.colors.cyanSoft,
    borderRadius: theme.radius.pill,
    height: 80,
    justifyContent: "center",
    width: 80,
  },
  heroCopy: {
    flex: 1,
    gap: theme.spacing.xxs,
    minWidth: 0,
  },
  heroMeta: {
    alignItems: "flex-end",
    gap: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  aliasTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.section,
  },
  pubKeyLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  pubKey: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: theme.type.caption,
  },
  badgeRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  lastSeenText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
  copyButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.xs,
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  copyButtonText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
  },
  heroNote: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.6,
  },
  sectionLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.8,
    paddingHorizontal: theme.spacing.xs,
    textTransform: "uppercase",
  },
  statsCard: {
    borderRadius: theme.radius.xl,
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
  secondaryActionsRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
});
