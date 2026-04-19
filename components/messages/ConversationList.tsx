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
import type { Thread } from "@/src/hooks/useMessages";
import { ConversationRow } from "./ConversationRow";

interface ConversationListProps {
  threads: Thread[];
  loading?: boolean;
  onSelect: (peerId: string) => void;
  /** Optional map from peerId → display alias */
  aliases?: Record<string, string>;
}

function LoadingState() {
  return (
    <View style={styles.empty}>
      <ActivityIndicator color={theme.colors.cyan} size="small" />
      <Text style={styles.emptyTitle}>Loading conversations…</Text>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Icon name="message-circle" size={32} color={theme.colors.textMuted} />
      <Text style={styles.emptyTitle}>No conversations yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap + to start a new conversation
      </Text>
    </View>
  );
}

export function ConversationList({
  threads,
  loading = false,
  onSelect,
  aliases = {},
}: ConversationListProps) {
  if (loading) return <LoadingState />;
  if (threads.length === 0) return <EmptyState />;

  return (
    <FlatList
      data={threads}
      keyExtractor={(item) => item.threadId}
      renderItem={({ item }) => (
        <ConversationRow
          thread={item}
          alias={aliases[item.peerId]}
          onPress={() => onSelect(item.peerId)}
        />
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
  empty: {
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
