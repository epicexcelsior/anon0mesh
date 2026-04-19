import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Icon } from "@/components/primitives/Icon";
import { appTheme as theme } from "@/src/design-system/theme";
import type { Peer } from "@/src/domain/entities/Peer";
import { PeerCard } from "./PeerCard";

interface PeersListProps {
  peers: Peer[];
  loading: boolean;
  error?: string | null;
  onPressPeer: (id: string) => void;
}

function PermissionDeniedState() {
  return (
    <View style={styles.emptyContainer}>
      <Icon name="bluetooth" size={32} color={theme.colors.textMuted} />
      <Text style={styles.emptyTitle}>Bluetooth unavailable</Text>
      <Text style={styles.emptySubtitle}>
        Enable Bluetooth in device settings to discover peers
      </Text>
    </View>
  );
}

function LoadingState() {
  return (
    <View style={styles.emptyContainer}>
      <ActivityIndicator color={theme.colors.cyan} size="small" />
      <Text style={styles.emptyTitle}>Scanning for peers…</Text>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Icon name="wifi-off" size={32} color={theme.colors.textMuted} />
      <Text style={styles.emptyTitle}>No peers in range</Text>
      <Text style={styles.emptySubtitle}>
        Move closer to a device running AnonMesh
      </Text>
    </View>
  );
}

export function PeersList({ peers, loading, error, onPressPeer }: PeersListProps) {
  if (error) return <PermissionDeniedState />;
  if (loading) return <LoadingState />;
  if (peers.length === 0) return <EmptyState />;

  return (
    <FlatList
      data={peers}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <PeerCard peer={item} onPress={() => onPressPeer(item.id)} />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: "center",
    flex: 1,
    gap: theme.spacing.md,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xxxl,
    paddingVertical: theme.spacing.huge,
  },
  emptyTitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
    textAlign: "center",
  },
  emptySubtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    textAlign: "center",
  },
});
