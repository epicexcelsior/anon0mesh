import { VP } from "@/constants/void-protocol";
import { useMeshChat } from "@/src/contexts/MeshBLEContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  CellSignalFull,
  CellSignalMedium,
  CellSignalLow,
  ChatCircle,
  CurrencyDollar,
  Copy,
  ShieldCheck,
  ShieldWarning,
  Broadcast,
  Timer,
  ArrowsLeftRight,
  Lock,
  Prohibit,
} from "phosphor-react-native";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import VoidCard from "../ui/VoidCard";
import VoidScreen from "../ui/VoidScreen";

// ── Helpers ─────────────────────────────────────────────────

function getSignalStrength(rssi?: number): {
  label: string;
  color: string;
  Icon: typeof CellSignalFull;
} {
  if (rssi == null)
    return { label: "Unknown", color: VP.colors.text.disabled, Icon: CellSignalLow };
  if (rssi > -60)
    return { label: "Strong", color: VP.colors.accent.cyan, Icon: CellSignalFull };
  if (rssi > -80)
    return { label: "Medium", color: VP.colors.status.warning, Icon: CellSignalMedium };
  return { label: "Weak", color: VP.colors.status.error, Icon: CellSignalLow };
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

// ── Component ───────────────────────────────────────────────

export default function PeerDetailScreen() {
  const router = useRouter();
  const { peerId } = useLocalSearchParams<{ peerId: string }>();

  const { peers: meshPeers } = useMeshChat();

  const peer = meshPeers.find((p) => p.peerId === peerId);

  const signal = getSignalStrength(peer?.rssi);

  const handleCopyAddress = async () => {
    if (!peerId) return;
    await Clipboard.setStringAsync(peerId);
    Alert.alert("Copied", "Peer address copied to clipboard");
  };

  const handleSendMessage = () => {
    if (!peerId) return;
    router.push({
      pathname: "/chat/thread",
      params: { selectedPeer: peerId },
    });
  };

  const handleSendPayment = () => {
    if (!peerId) return;
    router.push(`/wallet/send?recipient=${encodeURIComponent(peerId)}`);
  };

  if (!peer) {
    return (
      <VoidScreen>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={12}
          >
            <ArrowLeft size={22} color={VP.colors.text.primary} weight="regular" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PEER</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Peer not found or disconnected</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.notFoundAction}>Go back</Text>
          </TouchableOpacity>
        </View>
      </VoidScreen>
    );
  }

  const displayName = peer.nickname || peer.peerId.slice(0, 12);
  const initials = displayName.slice(0, 2).toUpperCase();
  const truncatedAddress = `${peer.peerId.slice(0, 6)}...${peer.peerId.slice(-4)}`;

  return (
    <VoidScreen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={12}
        >
          <ArrowLeft size={22} color={VP.colors.text.primary} weight="regular" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PEER</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile Section ────────────────────────── */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                !peer.isConnected && styles.statusDotOffline,
              ]}
            />
            <Text
              style={[
                styles.statusLabel,
                !peer.isConnected && styles.statusLabelOffline,
              ]}
            >
              {peer.isConnected ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        {/* ── Wallet Address ─────────────────────────── */}
        <TouchableOpacity onPress={handleCopyAddress} activeOpacity={0.7}>
          <VoidCard style={styles.addressCard}>
            <View style={styles.addressRow}>
              <Lock size={14} color={VP.colors.accent.purple} weight="fill" />
              <Text style={styles.addressText}>{truncatedAddress}</Text>
              <Copy size={16} color={VP.colors.text.secondary} weight="regular" />
            </View>
          </VoidCard>
        </TouchableOpacity>

        {/* ── Connection Details ──────────────────────── */}
        <Text style={styles.sectionLabel}>CONNECTION</Text>
        <VoidCard style={styles.detailsCard}>
          <DetailRow
            icon={<Broadcast size={18} color={VP.colors.accent.cyan} weight="regular" />}
            label="Type"
            value="BLE Direct"
          />
          <DetailRow
            icon={<signal.Icon size={18} color={signal.color} weight="regular" />}
            label="Signal"
            value={`${signal.label}${peer.rssi != null ? ` (${peer.rssi} dBm)` : ""}`}
            valueColor={signal.color}
          />
          <DetailRow
            icon={<Timer size={18} color={VP.colors.text.secondary} weight="regular" />}
            label="Last seen"
            value={timeAgo(peer.lastSeen)}
          />
          <DetailRow
            icon={
              peer.isVerified ? (
                <ShieldCheck size={18} color={VP.colors.accent.cyan} weight="fill" />
              ) : (
                <ShieldWarning size={18} color={VP.colors.status.warning} weight="regular" />
              )
            }
            label="Encryption"
            value={peer.isVerified ? "Verified (Noise)" : "Unverified"}
            valueColor={peer.isVerified ? VP.colors.accent.cyan : VP.colors.status.warning}
            isLast
          />
        </VoidCard>

        {/* ── Mesh Routing ───────────────────────────── */}
        <Text style={styles.sectionLabel}>MESH ROUTING</Text>
        <VoidCard style={styles.detailsCard}>
          <DetailRow
            icon={<ArrowsLeftRight size={18} color={VP.colors.text.secondary} weight="regular" />}
            label="Hop count"
            value="1 (direct)"
          />
          <DetailRow
            icon={<Broadcast size={18} color={VP.colors.text.secondary} weight="regular" />}
            label="Relay capable"
            value="Yes"
            valueColor={VP.colors.accent.cyan}
          />
          <DetailRow
            icon={<Lock size={18} color={VP.colors.accent.purple} weight="regular" />}
            label="Protocol"
            value="X25519 + ChaCha20"
            isLast
          />
        </VoidCard>

        {/* ── Action Buttons ─────────────────────────── */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSendMessage}
            activeOpacity={0.7}
          >
            <ChatCircle size={20} color={VP.colors.text.inverse} weight="fill" />
            <Text style={styles.actionButtonLabel}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonOutline]}
            onPress={handleSendPayment}
            activeOpacity={0.7}
          >
            <CurrencyDollar size={20} color={VP.colors.accent.cyan} weight="bold" />
            <Text style={styles.actionButtonLabelOutline}>Payment</Text>
          </TouchableOpacity>
        </View>

        {/* Block */}
        <TouchableOpacity style={styles.blockButton} activeOpacity={0.7}>
          <Prohibit size={16} color={VP.colors.status.error} weight="regular" />
          <Text style={styles.blockButtonText}>Block Peer</Text>
        </TouchableOpacity>
      </ScrollView>
    </VoidScreen>
  );
}

// ── Detail Row ──────────────────────────────────────────────

function DetailRow({
  icon,
  label,
  value,
  valueColor,
  isLast,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.detailRow, !isLast && styles.detailRowBorder]}>
      {icon}
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={[
          styles.detailValue,
          valueColor ? { color: valueColor } : undefined,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: VP.spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: VP.colors.ghostBorder,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    ...VP.typography.label,
    color: VP.colors.text.secondary,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  headerSpacer: {
    width: 30,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: VP.spacing.md,
    paddingTop: VP.spacing.lg,
    paddingBottom: VP.spacing.xxl,
  },

  // Profile
  profileSection: {
    alignItems: "center",
    marginBottom: VP.spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: VP.colors.accent.cyanMuted,
    borderWidth: 2,
    borderColor: VP.colors.accent.cyan,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: VP.spacing.sm,
  },
  avatarText: {
    fontSize: 24,
    fontFamily: "JetBrainsMono-Medium",
    color: VP.colors.accent.cyan,
  },
  displayName: {
    ...VP.typography.header,
    color: VP.colors.text.primary,
    marginBottom: VP.spacing.xs,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: VP.colors.accent.cyan,
  },
  statusDotOffline: {
    backgroundColor: VP.colors.text.disabled,
  },
  statusLabel: {
    ...VP.typography.body,
    color: VP.colors.accent.cyan,
  },
  statusLabelOffline: {
    color: VP.colors.text.disabled,
  },

  // Address card
  addressCard: {
    marginBottom: VP.spacing.md,
    paddingVertical: 10,
    paddingHorizontal: VP.spacing.md,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: VP.spacing.sm,
  },
  addressText: {
    ...VP.typography.mono,
    color: VP.colors.text.secondary,
    flex: 1,
    textAlign: "center",
  },

  // Section label
  sectionLabel: {
    ...VP.typography.label,
    color: VP.colors.text.secondary,
    textTransform: "uppercase",
    marginTop: VP.spacing.md,
    marginBottom: VP.spacing.sm,
  },

  // Detail cards
  detailsCard: {
    padding: 0,
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: VP.spacing.md,
    gap: VP.spacing.sm,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: VP.colors.ghostBorder,
  },
  detailLabel: {
    ...VP.typography.body,
    color: VP.colors.text.secondary,
    flex: 1,
  },
  detailValue: {
    ...VP.typography.monoSmall,
    color: VP.colors.text.primary,
  },

  // Actions
  actions: {
    flexDirection: "row",
    gap: VP.spacing.sm,
    marginTop: VP.spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: VP.spacing.sm,
    backgroundColor: VP.colors.accent.cyan,
    borderRadius: VP.radius.sm,
    paddingVertical: 14,
  },
  actionButtonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: VP.colors.accent.cyan,
  },
  actionButtonLabel: {
    ...VP.typography.body,
    color: VP.colors.text.inverse,
    fontFamily: "SpaceGrotesk-SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  actionButtonLabelOutline: {
    ...VP.typography.body,
    color: VP.colors.accent.cyan,
    fontFamily: "SpaceGrotesk-SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // Block
  blockButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: VP.spacing.sm,
    marginTop: VP.spacing.lg,
    paddingVertical: 12,
  },
  blockButtonText: {
    ...VP.typography.body,
    color: VP.colors.status.error,
    fontFamily: "SpaceGrotesk-Medium",
  },

  // Not found
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: VP.spacing.md,
  },
  notFoundText: {
    ...VP.typography.subheader,
    color: VP.colors.text.secondary,
  },
  notFoundAction: {
    ...VP.typography.body,
    color: VP.colors.accent.cyan,
    fontFamily: "SpaceGrotesk-SemiBold",
  },
});
