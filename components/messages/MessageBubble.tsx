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

function statusLabel(status: MessageStatus): string {
  switch (status) {
    case "sending":
      return "Queued on device";
    case "delivered":
      return "Delivered";
    case "failed":
      return "Failed to send";
  }
}

function shortTransactionId(transactionId: string): string {
  if (transactionId.length <= 18) return transactionId;
  return `${transactionId.slice(0, 10)}...${transactionId.slice(-4)}`;
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isSent = message.senderId === "self" || message.senderId === "user-me";
  const timestamp = relativeTime(message.sentAt);
  const dotColor = statusDotColor(message.status);
  const isFailed = isSent && message.status === "failed";
  const useAccentBubble = isSent && !isFailed;

  return (
    <View style={[styles.wrapper, isSent ? styles.wrapperSent : styles.wrapperReceived]}>
      <View
        style={[
          styles.bubble,
          useAccentBubble ? styles.bubbleSent : styles.bubbleReceived,
          isFailed ? styles.bubbleFailed : null,
        ]}
      >
        {message.content.type === "text" ? (
          <Text
            style={[
              styles.text,
              useAccentBubble ? styles.textSent : styles.textReceived,
            ]}
          >
            {message.content.text}
          </Text>
        ) : (
          <View style={styles.transferCard}>
            <View
              style={[
                styles.transferIconWrap,
                useAccentBubble
                  ? styles.transferIconWrapSent
                  : styles.transferIconWrapReceived,
              ]}
            >
              <Icon
                color={useAccentBubble ? theme.colors.textOnAccent : theme.colors.cyan}
                name="send"
                size={14}
              />
            </View>
            <View style={styles.transferCopy}>
              <Text
                style={[
                  styles.transferLabel,
                  useAccentBubble ? styles.textSent : styles.textReceived,
                ]}
              >
                Transfer receipt
              </Text>
              <Text
                style={[
                  styles.transferText,
                  useAccentBubble ? styles.textSent : styles.textReceived,
                ]}
              >
                {shortTransactionId(message.content.transactionId)}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={[styles.meta, isSent ? styles.metaSent : styles.metaReceived]}>
        <Text style={styles.metaTime}>{timestamp}</Text>
        <Icon name="lock" size={10} color={theme.colors.textMuted} />
        {isSent ? (
          <>
            <Text style={[styles.metaStatus, { color: dotColor }]}>
              {statusLabel(message.status)}
            </Text>
            <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: theme.spacing.xxs,
    maxWidth: "82%",
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
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  bubbleSent: {
    backgroundColor: theme.colors.cyan,
    borderBottomRightRadius: theme.radius.sm,
    borderColor: theme.colors.cyanBorderStrong,
  },
  bubbleReceived: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderBottomLeftRadius: theme.radius.sm,
    borderColor: theme.colors.line,
  },
  bubbleFailed: {
    backgroundColor: theme.colors.redSoft,
    borderColor: theme.colors.errorOutline,
  },
  text: {
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
    lineHeight: theme.type.body * 1.45,
  },
  textSent: {
    color: theme.colors.textOnAccent,
  },
  textReceived: {
    color: theme.colors.textPrimary,
  },
  transferCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  transferIconWrap: {
    alignItems: "center",
    borderRadius: theme.radius.pill,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  transferIconWrapSent: {
    backgroundColor: theme.colors.surfaceOnAccent,
  },
  transferIconWrapReceived: {
    backgroundColor: theme.colors.cyanSoft,
  },
  transferCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  transferLabel: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
    letterSpacing: 0.3,
    textTransform: "uppercase",
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
  metaStatus: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
  },
  statusDot: {
    borderRadius: theme.radius.pill,
    height: 6,
    width: 6,
  },
});
