import { VP } from "@/constants/void-protocol";
import { useMeshChat } from "@/src/contexts/MeshBLEContext";
import { useRouter } from "expo-router";
import { Broadcast, CaretRight } from "phosphor-react-native";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import VoidScreen from "../ui/VoidScreen";

interface Peer {
  id: string;
  transportId: string;
  name: string;
  lastActive: string;
  online: boolean;
  hasSession?: boolean;
  unreadCount?: number;
  rssi?: number;
}

export default function ChatSelectionScreenMesh() {
  const router = useRouter();
  const [pressedItemId, setPressedItemId] = useState<string | null>(null);

  // Get mesh chat context
  const {
    isInitialized,
    isConnected,
    myPeerId,
    myNickname,
    peers: meshPeers,
    connectedPeerCount,
    getUnreadCountForPeer,
    markPeerAsRead,
  } = useMeshChat();

  // Debug logging
  React.useEffect(() => {
    console.log("[ChatSelectionMesh] Mesh State:", {
      isInitialized,
      isConnected,
      myPeerId: myPeerId?.slice(0, 8),
      myNickname,
      peerCount: meshPeers.length,
      connectedCount: connectedPeerCount,
    });
  }, [
    isInitialized,
    isConnected,
    myPeerId,
    myNickname,
    meshPeers,
    connectedPeerCount,
  ]);

  // Convert mesh peers to UI format
  const peers: Peer[] = React.useMemo(() => {
    console.log("[ChatSelectionMesh] Converting mesh peers...");

    return meshPeers.map((peer) => ({
      id: peer.peerId,
      transportId: peer.peerId,
      name: peer.nickname || peer.peerId.slice(0, 8),
      lastActive: peer.isConnected
        ? "now"
        : new Date(peer.lastSeen).toLocaleTimeString(),
      online: peer.isConnected,
      hasSession: peer.isVerified,
      rssi: peer.rssi,
      unreadCount: getUnreadCountForPeer(peer.peerId),
    }));
  }, [meshPeers, getUnreadCountForPeer]);

  // Add "Broadcast to All" option at the top
  const renderBroadcastOption = () => (
    <TouchableOpacity
      style={[
        styles.peerItem,
        styles.broadcastItem,
        pressedItemId === "broadcast" && styles.peerItemPressed,
      ]}
      onPress={() => router.push("/chat/thread")}
      onPressIn={() => setPressedItemId("broadcast")}
      onPressOut={() => setPressedItemId(null)}
      activeOpacity={1}
    >
      <View style={styles.peerContent}>
        <View style={styles.peerLeft}>
          <View style={styles.peerInfo}>
            <View style={styles.broadcastIndicator}>
              <Broadcast size={16} color={VP.colors.accent.cyan} weight="regular" />
            </View>
            <Text style={styles.broadcastName}>Broadcast to All</Text>
          </View>
          <Text style={styles.broadcastSubtext}>
            Send message to {connectedPeerCount} connected{" "}
            {connectedPeerCount === 1 ? "peer" : "peers"}
          </Text>
        </View>
        <View style={styles.chevronIcon}>
          <CaretRight size={24} color={VP.colors.accent.cyan} weight="regular" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPeerItem = ({ item, index }: { item: Peer; index: number }) => {
    const isPressed = pressedItemId === item.id;
    const isOnline = item.online;
    const hasSecureSession = item.hasSession;

    // Derive signal strength label from RSSI
    const getSignalIcon = (rssi: number) => {
      if (rssi > -60) return "📶"; // strong
      if (rssi > -80) return "📳"; // medium
      return "📴"; // weak
    };

    return (
      <TouchableOpacity
        style={[styles.peerItem, isPressed && styles.peerItemPressed]}
        onPress={() => {
          markPeerAsRead(item.id);
          router.push({
            pathname: "/chat/thread",
            params: { selectedPeer: item.id },
          });
        }}
        onPressIn={() => setPressedItemId(item.id)}
        onPressOut={() => setPressedItemId(null)}
        activeOpacity={1}
      >
        <View style={styles.peerContent}>
          <View style={styles.peerLeft}>
            <View style={styles.peerInfo}>
              <View
                style={[
                  styles.onlineIndicator,
                  !isOnline && styles.onlineIndicatorOffline,
                ]}
              />
              <Text style={styles.peerName}>{item.name}</Text>
              {item.rssi != null && (
                <Text style={styles.rssiText}>{getSignalIcon(item.rssi)}</Text>
              )}
            </View>
            <Text style={styles.privateMessageLabel}>
              {hasSecureSession
                ? "🔒 Verified · Private"
                : "🔓 Unverified · Private"}
            </Text>
            <Text style={styles.lastActive}>
              {isOnline ? "Connected" : `Last seen ${item.lastActive}`}
            </Text>
          </View>
          {item.unreadCount ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {item.unreadCount > 99 ? "99+" : item.unreadCount}
              </Text>
            </View>
          ) : null}
          <View style={styles.chevronIcon}>
            <CaretRight size={24} color={VP.colors.accent.cyan} weight="regular" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <VoidScreen>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={styles.peersCountContainer}>
            <View
              style={[
                styles.peersCountDot,
                !isConnected && styles.peersCountDotOffline,
              ]}
            />
            <Text style={styles.peersCountText}>
              {connectedPeerCount} {connectedPeerCount === 1 ? "peer" : "peers"}{" "}
              connected
            </Text>
          </View>
        </View>

        {/* My Info */}
        <View style={styles.myInfoContainer}>
          <Text style={styles.myInfoText}>
            {myNickname} ({myPeerId ? myPeerId.slice(0, 8) : "..."}{" "}
            {isConnected ? "🟢" : "🔴"})
          </Text>
        </View>

        {/* Peer List */}
        <View style={styles.peerListContainer}>
          <FlatList
            data={peers}
            renderItem={renderPeerItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.peerListContent}
            ListHeaderComponent={
              connectedPeerCount > 0 ? renderBroadcastOption : null
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No peers discovered yet</Text>
                <Text style={styles.emptySubtext}>
                  {isInitialized
                    ? "BLE mesh is active. Nearby devices will appear here."
                    : "Initializing BLE mesh..."}
                </Text>
              </View>
            }
          />
        </View>

    </VoidScreen>
  );
}

const styles = StyleSheet.create({
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
  peersCountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  peersCountDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: VP.colors.accent.cyan,
  },
  peersCountDotOffline: {
    backgroundColor: VP.colors.status.error,
  },
  peersCountText: {
    ...VP.typography.monoSmall,
    color: VP.colors.accent.cyan,
    marginLeft: 6,
  },
  myInfoContainer: {
    paddingHorizontal: VP.spacing.md,
    paddingVertical: VP.spacing.sm,
    backgroundColor: VP.colors.accent.cyanGhost,
    borderBottomWidth: 1,
    borderBottomColor: VP.colors.ghostBorder,
  },
  myInfoText: {
    ...VP.typography.monoSmall,
    color: VP.colors.text.secondary,
  },
  statusText: {
    fontSize: 12,
    marginTop: 2,
  },
  statusOnline: {
    color: VP.colors.accent.cyan,
  },
  statusOffline: {
    color: VP.colors.status.error,
  },
  peerListContainer: {
    flex: 1,
    paddingTop: VP.spacing.md,
  },
  peerListContent: {
    paddingHorizontal: VP.spacing.sm,
    paddingBottom: 20,
  },
  peerItem: {
    backgroundColor: "transparent",
    borderRadius: VP.radius.md,
    marginBottom: 4,
    marginHorizontal: VP.spacing.sm,
  },
  peerItemPressed: {
    backgroundColor: VP.colors.surface,
  },
  peerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: VP.spacing.md,
    paddingVertical: VP.spacing.md,
  },
  peerLeft: {
    flexDirection: "column",
    alignItems: "flex-start",
    flex: 1,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: VP.colors.accent.cyan,
    marginRight: 12,
  },
  onlineIndicatorOffline: {
    backgroundColor: VP.colors.text.disabled,
  },
  peerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  peerName: {
    ...VP.typography.subheader,
    color: VP.colors.text.primary,
    fontFamily: "SpaceGrotesk-SemiBold",
  },
  secureIcon: {
    fontSize: 14,
    marginLeft: 6,
  },
  privateMessageLabel: {
    ...VP.typography.caption,
    color: VP.colors.accent.cyan,
    marginTop: 4,
    marginBottom: 2,
  },
  rssiText: {
    fontSize: 12,
    marginLeft: 4,
  },
  lastActive: {
    ...VP.typography.body,
    color: VP.colors.text.secondary,
    fontFamily: "SpaceGrotesk-Medium",
    marginRight: VP.spacing.md,
  },
  chevronIcon: {
    marginLeft: 0,
  },
  unreadBadge: {
    backgroundColor: VP.colors.status.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginRight: 12,
  },
  unreadBadgeText: {
    color: VP.colors.text.primary,
    fontSize: 12,
    fontFamily: "SpaceGrotesk-Bold",
  },
  firstPeerItem: {
    backgroundColor: VP.colors.surfaceElevated,
  },
  broadcastItem: {
    backgroundColor: VP.colors.accent.cyanGhost,
    borderWidth: 1,
    borderColor: VP.colors.accent.cyanMuted,
  },
  broadcastIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: VP.colors.accent.cyanMuted,
    borderWidth: 1,
    borderColor: VP.colors.accent.cyan,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  broadcastName: {
    ...VP.typography.subheader,
    color: VP.colors.accent.cyan,
    fontFamily: "SpaceGrotesk-SemiBold",
  },
  broadcastSubtext: {
    ...VP.typography.body,
    color: VP.colors.text.secondary,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    ...VP.typography.subheader,
    color: VP.colors.text.secondary,
    textAlign: "center",
    marginBottom: VP.spacing.sm,
  },
  emptySubtext: {
    ...VP.typography.body,
    color: VP.colors.text.disabled,
    textAlign: "center",
  },
});
