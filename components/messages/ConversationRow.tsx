import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Icon } from "@/components/primitives/Icon";
import { appTheme as theme } from "@/src/design-system/theme";
import type { Thread } from "@/src/hooks/useMessages";

function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function getInitial(alias: string): string {
  return alias.trim().charAt(0).toUpperCase() || "?";
}

interface ConversationRowProps {
  thread: Thread;
  alias?: string;
  onPress: () => void;
}

export function ConversationRow({ thread, alias, onPress }: ConversationRowProps) {
  const displayName = alias ?? thread.peerId;
  const initial = getInitial(displayName);
  const lastMsg = thread.lastMessage;

  let preview = "No messages yet";
  if (lastMsg) {
    if (lastMsg.content.type === "text") {
      preview = lastMsg.content.text;
    } else {
      preview = `Transfer: ${lastMsg.content.transactionId}`;
    }
  }

  const timestamp = lastMsg ? relativeTime(lastMsg.sentAt) : "";

  return (
    <TouchableOpacity
      accessibilityLabel={`Open conversation with ${displayName}`}
      accessibilityRole="button"
      activeOpacity={0.75}
      onPress={onPress}
      style={styles.row}
    >
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarInitial}>{initial}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Row 1: alias + timestamp */}
        <View style={styles.row1}>
          <View style={styles.aliasRow}>
            <Text style={styles.alias} numberOfLines={1}>
              {displayName}
            </Text>
            <Icon name="lock" size={10} color={theme.colors.textMuted} />
          </View>
          {timestamp ? (
            <Text style={styles.timestamp}>{timestamp}</Text>
          ) : null}
        </View>

        {/* Row 2: preview + unread dot */}
        <View style={styles.row2}>
          <Text style={styles.preview} numberOfLines={1} ellipsizeMode="tail">
            {preview}
          </Text>
          {thread.unreadCount > 0 ? <View style={styles.unreadDot} /> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    borderBottomColor: theme.colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: theme.colors.cyanSoft,
    borderRadius: theme.radius.pill,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  avatarInitial: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  content: {
    flex: 1,
    gap: theme.spacing.xxs,
  },
  row1: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  aliasRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  alias: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
    flexShrink: 1,
  },
  timestamp: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
  row2: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  preview: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
  },
  unreadDot: {
    backgroundColor: theme.colors.green,
    borderRadius: theme.radius.pill,
    height: 8,
    width: 8,
  },
});
