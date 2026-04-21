import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import type { PillTone } from "@/components/primitives/Pill";
import type { Transaction } from "@/src/domain/entities/Transaction";
import { appTheme as theme } from "@/src/design-system/theme";
import type { TransferStatus } from "@/src/domain/status/TransferStatus";

function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function statusTone(status: TransferStatus): PillTone {
  switch (status) {
    case "Settled":
      return "green";
    case "Queued on device":
      return "amber";
    case "Handed to mesh":
      return "cyan";
    default:
      return "neutral";
  }
}

interface TxRowProps {
  tx: Transaction;
  onPress?: () => void;
}

export function TxRow({ tx, onPress }: TxRowProps) {
  const isSend = tx.direction === "send";
  const counterparty = isSend ? tx.recipientId : tx.senderId;
  const shortCounterparty =
    counterparty.length > 14
      ? `${counterparty.slice(0, 8)}...${counterparty.slice(-4)}`
      : counterparty;

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.row}>
      <View style={[styles.badge, isSend ? styles.sendBadge : styles.receiveBadge]}>
        <Icon
          name={isSend ? "arrow-up-right" : "arrow-down-left"}
          size={14}
          color={isSend ? theme.colors.cyan : theme.colors.green}
        />
      </View>

      <View style={styles.meta}>
        <Text style={styles.counterparty} numberOfLines={1}>
          {shortCounterparty}
        </Text>
        <Text style={styles.timestamp}>{relativeTime(tx.createdAt)}</Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, isSend ? styles.amountSend : styles.amountReceive]}>
          {isSend ? "-" : "+"}
          {tx.amount} {tx.symbol}
        </Text>
        <Pill label={tx.status} tone={statusTone(tx.status)} />
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  badge: {
    alignItems: "center",
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  sendBadge: {
    backgroundColor: theme.colors.cyanSoft,
    borderColor: theme.colors.cyanSoft,
  },
  receiveBadge: {
    backgroundColor: theme.colors.greenSoft,
    borderColor: theme.colors.greenSoft,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  counterparty: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: theme.type.caption,
  },
  timestamp: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.micro,
  },
  right: {
    alignItems: "flex-end",
    gap: 2,
  },
  amount: {
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: theme.type.bodyLg,
  },
  amountSend: {
    color: theme.colors.textPrimary,
  },
  amountReceive: {
    color: theme.colors.green,
  },
});
