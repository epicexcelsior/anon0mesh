import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { DepthButton } from "@/components/primitives/DepthButton";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { appTheme as theme } from "@/src/design-system/theme";
import type { Peer } from "@/src/domain/entities/Peer";
import { PeerCard } from "./PeerCard";

interface PeersListAction {
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  tone?: "cyan" | "green" | "red" | "purple" | "amber";
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost";
}

interface PeersListProps {
  emptyAction?: PeersListAction;
  error?: string | null;
  errorAction?: PeersListAction;
  loading: boolean;
  onPressPeer: (id: string) => void;
  peers: Peer[];
}

function StateCard({
  action,
  icon,
  subtitle,
  title,
}: {
  action?: PeersListAction;
  icon: React.ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <GlassSurface style={styles.emptyContainer} variant="strong">
      {icon}
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
      {action ? (
        <DepthButton
          disabled={action.disabled}
          icon={action.icon}
          label={action.label}
          onPress={action.onPress}
          size="md"
          style={styles.emptyAction}
          tone={action.tone ?? "cyan"}
          variant={action.variant ?? "secondary"}
        />
      ) : null}
    </GlassSurface>
  );
}

function PermissionDeniedState({ action }: { action?: PeersListAction }) {
  return (
    <StateCard
      action={action}
      icon={<Icon name="bluetooth" size={32} color={theme.colors.textMuted} />}
      subtitle="Enable Bluetooth in device settings to discover peers."
      title="Bluetooth unavailable"
    />
  );
}

function LoadingState() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator color={theme.colors.cyan} size="small" />
      <Text style={styles.emptyTitle}>Scanning for peers...</Text>
    </View>
  );
}

function EmptyState({ action }: { action?: PeersListAction }) {
  return (
    <StateCard
      action={action}
      icon={<Icon name="wifi-off" size={32} color={theme.colors.textMuted} />}
      subtitle="Move closer to another device running AnonMesh or refresh the current scan."
      title="No peers in range"
    />
  );
}

export function PeersList({
  peers,
  loading,
  error,
  onPressPeer,
  errorAction,
  emptyAction,
}: PeersListProps) {
  if (error) return <PermissionDeniedState action={errorAction} />;
  if (loading) return <LoadingState />;
  if (peers.length === 0) return <EmptyState action={emptyAction} />;

  return (
    <FlatList
      data={peers}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <PeerCard peer={item} onPress={() => onPressPeer(item.id)} />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
    paddingBottom: theme.component.nav.barHeight + theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
  },
  separator: {
    height: theme.spacing.sm,
  },
  emptyContainer: {
    alignItems: "center",
    gap: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xxxl,
    paddingVertical: theme.spacing.xxxl,
  },
  emptyAction: {
    minWidth: 164,
  },
  loadingContainer: {
    alignItems: "center",
    flex: 1,
    gap: theme.spacing.md,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xxxl,
    paddingVertical: theme.spacing.huge,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.bodyLg,
    textAlign: "center",
  },
  emptySubtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.55,
    textAlign: "center",
  },
});
