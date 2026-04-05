import { VP } from "@/constants/void-protocol";
import { useMeshChat } from "@/src/contexts/MeshBLEContext";
import { useRouter } from "expo-router";
import {
  Broadcast,
  CellSignalFull,
  CellSignalMedium,
  CellSignalLow,
  Globe,
  House,
  Buildings,
  MapPin,
  Users,
  Book,
  Hash,
  Plus,
  ShieldCheck,
  ShieldWarning,
  CaretRight,
} from "phosphor-react-native";
import type { Icon } from "phosphor-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import VoidCard from "../ui/VoidCard";
import VoidScreen from "../ui/VoidScreen";

// ── Zone Types ──────────────────────────────────────────────

type ZoneType =
  | "local"
  | "neighborhood"
  | "city"
  | "regional"
  | "national"
  | "global";

interface Zone {
  id: string;
  type: ZoneType;
  label: string;
  range: string;
  IconComponent: Icon;
}

interface CustomZone {
  id: string;
  name: string;
  range: string;
}

const PRESET_ZONES: Zone[] = [
  { id: "local", type: "local", label: "Local", range: "100m", IconComponent: MapPin },
  { id: "neighborhood", type: "neighborhood", label: "Neighborhood", range: "10km", IconComponent: House },
  { id: "city", type: "city", label: "City", range: "100km", IconComponent: Buildings },
  { id: "regional", type: "regional", label: "Regional", range: "1 000km", IconComponent: Users },
  { id: "national", type: "national", label: "National", range: "5 000km", IconComponent: Book },
  { id: "global", type: "global", label: "Global", range: "", IconComponent: Globe },
];

const MOCK_CUSTOM_ZONES: CustomZone[] = [
  { id: "custom1", name: "MyCustomZone #123456", range: "100m" },
  { id: "custom2", name: "MyCustomZone #789012", range: "100m" },
];

// ── Helpers ─────────────────────────────────────────────────

function getSignalIcon(rssi?: number) {
  if (rssi == null) return null;
  if (rssi > -60) return CellSignalFull;
  if (rssi > -80) return CellSignalMedium;
  return CellSignalLow;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 10) return "now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

// ── Component ───────────────────────────────────────────────

export default function MeshZoneScreen() {
  const router = useRouter();
  const [selectedZone, setSelectedZone] = useState<string>("local");
  const [customZones] = useState<CustomZone[]>(MOCK_CUSTOM_ZONES);

  const {
    isInitialized,
    isConnected,
    peers: meshPeers,
    connectedPeerCount,
  } = useMeshChat();

  const connectedPeers = meshPeers.filter((p) => p.isConnected);

  return (
    <VoidScreen>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mesh Zone</Text>
        <View style={styles.bleStatus}>
          <View
            style={[
              styles.bleDot,
              !isConnected && styles.bleDotOffline,
            ]}
          />
          <Text
            style={[
              styles.bleLabel,
              !isConnected && styles.bleLabelOffline,
            ]}
          >
            {isConnected ? "BLE ACTIVE" : "BLE OFFLINE"}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Scanning Status */}
        {isInitialized && (
          <View style={styles.scanningRow}>
            <Broadcast
              size={16}
              color={VP.colors.accent.cyan}
              weight="regular"
            />
            <Text style={styles.scanningText}>
              {connectedPeerCount > 0
                ? `${connectedPeerCount} active ${connectedPeerCount === 1 ? "node" : "nodes"}`
                : "Scanning for nearby nodes..."}
            </Text>
          </View>
        )}

        {/* ── Active Nodes ─────────────────────────────── */}
        {connectedPeers.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>ACTIVE NODES</Text>
            {connectedPeers.map((peer) => {
              const SignalIcon = getSignalIcon(peer.rssi);
              return (
                <TouchableOpacity
                  key={peer.peerId}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: "/mesh/[peerId]",
                      params: { peerId: peer.peerId },
                    })
                  }
                >
                  <VoidCard style={styles.nodeCard}>
                    <View style={styles.nodeRow}>
                      {/* Avatar */}
                      <View style={styles.nodeAvatar}>
                        <Text style={styles.nodeAvatarText}>
                          {(peer.nickname || peer.peerId)
                            .slice(0, 2)
                            .toUpperCase()}
                        </Text>
                      </View>

                      {/* Info */}
                      <View style={styles.nodeInfo}>
                        <View style={styles.nodeNameRow}>
                          <Text style={styles.nodeName} numberOfLines={1}>
                            {peer.nickname || peer.peerId.slice(0, 12)}
                          </Text>
                          {peer.isVerified ? (
                            <ShieldCheck
                              size={14}
                              color={VP.colors.accent.cyan}
                              weight="fill"
                            />
                          ) : (
                            <ShieldWarning
                              size={14}
                              color={VP.colors.status.warning}
                              weight="regular"
                            />
                          )}
                        </View>
                        <View style={styles.nodeMetaRow}>
                          <Text style={styles.nodeConnectionType}>DIRECT</Text>
                          <Text style={styles.nodeSeparator}>  </Text>
                          <Text style={styles.nodeAddress}>
                            {peer.peerId.slice(0, 6)}...{peer.peerId.slice(-4)}
                          </Text>
                        </View>
                      </View>

                      {/* Signal + chevron */}
                      <View style={styles.nodeRight}>
                        {SignalIcon && (
                          <SignalIcon
                            size={18}
                            color={VP.colors.accent.cyan}
                            weight="regular"
                          />
                        )}
                        <Text style={styles.nodeLastSeen}>
                          {timeAgo(peer.lastSeen)}
                        </Text>
                        <CaretRight
                          size={16}
                          color={VP.colors.text.disabled}
                          weight="regular"
                        />
                      </View>
                    </View>
                  </VoidCard>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* Empty state for nodes */}
        {connectedPeers.length === 0 && isInitialized && (
          <VoidCard style={styles.emptyCard}>
            <Broadcast
              size={32}
              color={VP.colors.text.disabled}
              weight="regular"
            />
            <Text style={styles.emptyTitle}>No nodes nearby</Text>
            <Text style={styles.emptySubtext}>
              BLE mesh is active. Nearby devices will appear here automatically.
            </Text>
          </VoidCard>
        )}

        {/* ── Select Mesh Zone ─────────────────────────── */}
        <Text style={styles.sectionLabel}>SELECT MESH ZONE</Text>

        <View style={styles.zonesContainer}>
          {PRESET_ZONES.map((zone) => {
            const isSelected = selectedZone === zone.id;
            return (
              <TouchableOpacity
                key={zone.id}
                style={[
                  styles.zoneButton,
                  isSelected && styles.zoneButtonSelected,
                ]}
                onPress={() => setSelectedZone(zone.id)}
                activeOpacity={0.7}
              >
                <View style={styles.zoneContent}>
                  <zone.IconComponent
                    size={22}
                    color={
                      isSelected
                        ? VP.colors.accent.cyan
                        : VP.colors.text.secondary
                    }
                    weight="regular"
                  />
                  <Text
                    style={[
                      styles.zoneLabel,
                      isSelected && styles.zoneLabelSelected,
                    ]}
                  >
                    {zone.label}
                  </Text>
                  {zone.range ? (
                    <Text
                      style={[
                        styles.zoneRange,
                        isSelected && styles.zoneRangeSelected,
                      ]}
                    >
                      {zone.range}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Custom Zones ─────────────────────────────── */}
        <Text style={styles.sectionLabel}>CUSTOM ZONES</Text>

        <View style={styles.zonesContainer}>
          {customZones.map((cz, index) => {
            const isFirst = index === 0;
            return (
              <TouchableOpacity
                key={cz.id}
                style={[
                  styles.zoneButton,
                  isFirst && styles.zoneButtonSelected,
                ]}
                onPress={() => setSelectedZone(cz.id)}
                activeOpacity={0.7}
              >
                <View style={styles.zoneContent}>
                  <Hash
                    size={22}
                    color={
                      isFirst
                        ? VP.colors.accent.cyan
                        : VP.colors.text.disabled
                    }
                    weight="regular"
                  />
                  <Text
                    style={[
                      styles.zoneLabel,
                      isFirst
                        ? styles.zoneLabelSelected
                        : styles.zoneLabelDim,
                    ]}
                  >
                    {cz.name}
                  </Text>
                  <Text
                    style={[
                      styles.zoneRange,
                      isFirst
                        ? styles.zoneRangeSelected
                        : styles.zoneRangeDim,
                    ]}
                  >
                    {cz.range}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Create new zone */}
          <TouchableOpacity style={styles.createButton} activeOpacity={0.7}>
            <Plus size={18} color={VP.colors.accent.cyan} weight="regular" />
            <Text style={styles.createButtonText}>Create new mesh zone</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </VoidScreen>
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
  headerTitle: {
    ...VP.typography.header,
    color: VP.colors.text.primary,
  },
  bleStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: VP.colors.accent.cyanGhost,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: VP.radius.full,
  },
  bleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: VP.colors.accent.cyan,
    marginRight: 6,
  },
  bleDotOffline: {
    backgroundColor: VP.colors.status.error,
  },
  bleLabel: {
    ...VP.typography.caption,
    color: VP.colors.accent.cyan,
    fontFamily: "SpaceGrotesk-Medium",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  bleLabelOffline: {
    color: VP.colors.status.error,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: VP.spacing.md,
    paddingTop: VP.spacing.md,
    paddingBottom: VP.spacing.xl,
  },

  // Scanning status
  scanningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: VP.spacing.md,
  },
  scanningText: {
    ...VP.typography.body,
    color: VP.colors.accent.cyan,
  },

  // Section labels
  sectionLabel: {
    ...VP.typography.label,
    color: VP.colors.text.secondary,
    textTransform: "uppercase",
    marginTop: VP.spacing.lg,
    marginBottom: VP.spacing.sm,
  },

  // Node cards
  nodeCard: {
    marginBottom: VP.spacing.sm,
    padding: VP.spacing.md,
  },
  nodeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  nodeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: VP.colors.accent.cyanMuted,
    borderWidth: 1,
    borderColor: VP.colors.accent.cyan,
    alignItems: "center",
    justifyContent: "center",
    marginRight: VP.spacing.sm,
  },
  nodeAvatarText: {
    ...VP.typography.label,
    color: VP.colors.accent.cyan,
    fontFamily: "JetBrainsMono-Medium",
    letterSpacing: 0,
  },
  nodeInfo: {
    flex: 1,
  },
  nodeNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  nodeName: {
    ...VP.typography.subheader,
    color: VP.colors.text.primary,
    fontFamily: "SpaceGrotesk-SemiBold",
    flexShrink: 1,
  },
  nodeMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  nodeConnectionType: {
    ...VP.typography.caption,
    color: VP.colors.accent.cyan,
    fontFamily: "SpaceGrotesk-Medium",
    letterSpacing: 0.5,
  },
  nodeSeparator: {
    color: VP.colors.text.disabled,
    fontSize: 10,
  },
  nodeAddress: {
    ...VP.typography.monoSmall,
    color: VP.colors.text.disabled,
  },
  nodeRight: {
    alignItems: "flex-end",
    gap: 4,
    marginLeft: VP.spacing.sm,
  },
  nodeLastSeen: {
    ...VP.typography.caption,
    color: VP.colors.text.disabled,
  },

  // Empty state
  emptyCard: {
    alignItems: "center",
    paddingVertical: VP.spacing.xl,
    gap: VP.spacing.sm,
  },
  emptyTitle: {
    ...VP.typography.subheader,
    color: VP.colors.text.secondary,
    textAlign: "center",
  },
  emptySubtext: {
    ...VP.typography.body,
    color: VP.colors.text.disabled,
    textAlign: "center",
    paddingHorizontal: VP.spacing.lg,
  },

  // Zone buttons
  zonesContainer: {
    gap: VP.spacing.sm,
  },
  zoneButton: {
    backgroundColor: VP.colors.surface,
    borderRadius: VP.radius.md,
    borderWidth: 1,
    borderColor: VP.colors.ghostBorder,
    paddingVertical: 14,
    paddingHorizontal: VP.spacing.md,
  },
  zoneButtonSelected: {
    backgroundColor: VP.colors.accent.cyanMuted,
    borderColor: VP.colors.accent.cyan,
  },
  zoneContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: VP.spacing.sm,
  },
  zoneLabel: {
    ...VP.typography.subheader,
    color: VP.colors.text.primary,
    flex: 1,
  },
  zoneLabelSelected: {
    color: VP.colors.accent.cyan,
  },
  zoneLabelDim: {
    color: VP.colors.text.disabled,
  },
  zoneRange: {
    ...VP.typography.monoSmall,
    color: VP.colors.text.secondary,
  },
  zoneRangeSelected: {
    color: VP.colors.accent.cyan,
  },
  zoneRangeDim: {
    color: VP.colors.text.disabled,
  },

  // Create button
  createButton: {
    backgroundColor: "transparent",
    borderRadius: VP.radius.md,
    borderWidth: 1,
    borderColor: VP.colors.accent.cyan,
    borderStyle: "dashed",
    paddingVertical: 12,
    paddingHorizontal: VP.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: VP.spacing.sm,
  },
  createButtonText: {
    ...VP.typography.body,
    color: VP.colors.accent.cyan,
    fontFamily: "SpaceGrotesk-Medium",
  },
});
