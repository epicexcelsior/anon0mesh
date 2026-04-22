import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import { SignalBars } from "@/components/primitives/SignalBars";
import { appTheme as theme } from "@/src/design-system/theme";
import type { Peer } from "@/src/domain/entities/Peer";
import type { Thread } from "@/src/hooks/useMessages";

function relativeTime(ms: number) {
  const diff = Date.now() - ms;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function shortAddress(address?: string) {
  if (!address) return "Peer address pending";
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}…${address.slice(-4)}`;
}

function transportLabel(transport?: Peer["transport"]) {
  switch (transport) {
    case "ble":
      return "BLE";
    case "wifi-direct":
      return "Wi-Fi";
    case "lxmf":
      return "LXMF";
    default:
      return "Peer";
  }
}

function previewCopy(thread: Thread) {
  const lastMessage = thread.lastMessage;
  if (!lastMessage) return "No messages yet";

  if (lastMessage.content.type === "transfer") {
    return "Transfer receipt attached";
  }

  const prefix =
    lastMessage.senderId === "self" || lastMessage.senderId === "user-me"
      ? "You · "
      : "";

  return `${prefix}${lastMessage.content.text}`;
}

function statusLabel(thread: Thread) {
  const status = thread.lastMessage?.status;
  if (status === "sending") return "Queued on device";
  if (status === "failed") return "Failed";
  return null;
}

function statusTone(status: string | null) {
  if (status === "Failed") return "red" as const;
  if (status === "Queued on device") return "amber" as const;
  return "neutral" as const;
}

interface ConversationRowProps {
  thread: Thread;
  peer?: Peer;
  onPress: () => void;
}

export function ConversationRow({
  thread,
  peer,
  onPress,
}: ConversationRowProps) {
  const displayName = peer?.alias ?? thread.peerId;
  const timestamp = thread.lastMessage ? relativeTime(thread.lastMessage.sentAt) : "";
  const status = statusLabel(thread);

  return (
    <TouchableOpacity
      accessibilityLabel={`Open conversation with ${displayName}`}
      accessibilityRole="button"
      activeOpacity={0.82}
      onPress={onPress}
      style={styles.row}
    >
      <View style={styles.avatar}>
        <Icon
          color={peer?.isTrusted ? theme.colors.green : theme.colors.cyan}
          name="lock-mesh"
          size={16}
        />
      </View>

      <View style={styles.copyBlock}>
        <View style={styles.titleRow}>
          <View style={styles.titleCopy}>
            <Text numberOfLines={1} style={styles.alias}>
              {displayName}
            </Text>
            <Text numberOfLines={1} style={styles.address}>
              {shortAddress(peer?.publicKey)}
            </Text>
          </View>

          <View style={styles.trailingMeta}>
            {thread.unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{thread.unreadCount}</Text>
              </View>
            ) : null}
            {timestamp ? <Text style={styles.timestamp}>{timestamp}</Text> : null}
            {peer ? <SignalBars strength={peer.signalStrength} /> : null}
          </View>
        </View>

        <View style={styles.previewRow}>
          <View style={styles.previewCopy}>
            <Icon color={theme.colors.textMuted} name="lock" size={11} />
            <Text numberOfLines={1} style={styles.preview}>
              {previewCopy(thread)}
            </Text>
          </View>

          {status ? (
            <Pill
              label={status}
              tone={statusTone(status)}
            />
          ) : (
            <Pill label={transportLabel(peer?.transport)} tone="neutral" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    minHeight: 84,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: theme.colors.cyanSoft,
    borderRadius: theme.radius.pill,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  copyBlock: {
    flex: 1,
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleCopy: {
    flex: 1,
    gap: 2,
    marginRight: theme.spacing.md,
    minWidth: 0,
  },
  alias: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.body,
  },
  address: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: theme.type.micro,
  },
  trailingMeta: {
    alignItems: "flex-end",
    gap: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  unreadBadge: {
    alignItems: "center",
    backgroundColor: theme.colors.cyan,
    borderRadius: theme.radius.pill,
    justifyContent: "center",
    minWidth: 18,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  unreadCount: {
    color: theme.colors.textOnAccent,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
  },
  timestamp: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.micro,
  },
  previewRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
  },
  previewCopy: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: theme.spacing.xs,
    minWidth: 0,
  },
  preview: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
});
