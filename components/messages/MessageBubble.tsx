import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/primitives/Icon";
import { appTheme as theme } from "@/src/design-system/theme";
import type { Message, MessageStatus } from "@/src/domain/entities/Message";

function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function statusDotColor(status: MessageStatus): string {
  switch (status) {
    case "sending":
      return theme.colors.amber;
    case "delivered":
      return theme.colors.green;
    case "failed":
      return theme.colors.red;
  }
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isSent = message.senderId === "user-me";
  const timestamp = relativeTime(message.sentAt);
  const dotColor = statusDotColor(message.status);

  return (
    <View style={[styles.wrapper, isSent ? styles.wrapperSent : styles.wrapperReceived]}>
      {/* Bubble */}
      <View style={[styles.bubble, isSent ? styles.bubbleSent : styles.bubbleReceived]}>
        {message.content.type === "text" ? (
          <Text style={[styles.text, isSent ? styles.textSent : styles.textReceived]}>
            {message.content.text}
          </Text>
        ) : (
          <View style={styles.transferChip}>
            <Text style={styles.transferEmoji}>💰</Text>
            <Text style={[styles.transferText, isSent ? styles.textSent : styles.textReceived]}>
              Transfer: {message.content.transactionId}
            </Text>
          </View>
        )}
      </View>

      {/* Meta row */}
      <View style={[styles.meta, isSent ? styles.metaSent : styles.metaReceived]}>
        <Text style={styles.metaTime}>{timestamp}</Text>
        <Icon name="lock" size={10} color={theme.colors.textMuted} />
        <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: theme.spacing.xxs,
    maxWidth: "78%",
    paddingHorizontal: theme.spacing.lg,
  },
  wrapperSent: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  wrapperReceived: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  bubble: {
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  bubbleSent: {
    backgroundColor: theme.colors.cyan,
    borderBottomRightRadius: theme.radius.sm,
  },
  bubbleReceived: {
    backgroundColor: theme.colors.surfaceMuted,
    borderBottomLeftRadius: theme.radius.sm,
  },
  text: {
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
  },
  textSent: {
    color: theme.colors.textOnAccent,
  },
  textReceived: {
    color: theme.colors.textPrimary,
  },
  transferChip: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  transferEmoji: {
    fontSize: theme.type.body,
  },
  transferText: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  meta: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xxs,
  },
  metaSent: {
    justifyContent: "flex-end",
  },
  metaReceived: {
    justifyContent: "flex-start",
  },
  metaTime: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.micro,
  },
  statusDot: {
    borderRadius: theme.radius.pill,
    height: 6,
    width: 6,
  },
});
