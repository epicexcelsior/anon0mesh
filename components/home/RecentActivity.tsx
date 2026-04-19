import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import type { PillTone } from "@/components/primitives/Pill";
import { useTransaction } from "@/src/hooks/useTransaction";
import type { TransferStatus } from "@/src/domain/status/TransferStatus";
import type { Transaction } from "@/src/domain/entities/Transaction";
import { appTheme as theme } from "@/src/design-system/theme";

function statusTone(status: TransferStatus): PillTone {
  switch (status) {
    case "Settled":
      return "green";
    case "Handed to mesh":
      return "cyan";
    case "Queued on device":
      return "amber";
    default:
      return "neutral";
  }
}

function statusLabel(status: TransferStatus): string {
  // D29: never use Pending/Broadcasting/Confirmed/Incognito — use canonical TransferStatus strings
  return status;
}

function ActivityRow({ tx }: { tx: Transaction }) {
  const isSend = tx.direction === "send";
  const tone = statusTone(tx.status);

  return (
    <View style={styles.row}>
      <View style={[styles.directionBadge, isSend ? styles.sendBadge : styles.receiveBadge]}>
        <Icon
          name={isSend ? "arrow-up-right" : "arrow-down-left"}
          size={14}
          color={isSend ? theme.colors.cyan : theme.colors.green}
        />
      </View>

      <View style={styles.rowMeta}>
        <Text style={styles.counterparty} numberOfLines={1}>
          {isSend ? tx.recipientId.slice(0, 10) + "…" : tx.senderId.slice(0, 10) + "…"}
        </Text>
        <Pill label={statusLabel(tx.status)} tone={tone} />
      </View>

      <View style={styles.amountBlock}>
        <Text style={[styles.amount, isSend ? styles.amountSend : styles.amountReceive]}>
          {isSend ? "-" : "+"}{tx.amount}
        </Text>
        <Text style={styles.symbol}>{tx.symbol}</Text>
      </View>
    </View>
  );
}

export function RecentActivity() {
  const { recent } = useTransaction();

  if (recent.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Icon name="inbox" size={24} color={theme.colors.textMuted} />
        <Text style={styles.emptyText}>No recent activity</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    >
      {recent.map((tx) => (
        <ActivityRow key={tx.id} tx={tx} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  list: {
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  row: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  directionBadge: {
    alignItems: "center",
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  sendBadge: {
    backgroundColor: theme.colors.cyanSoft,
    borderColor: theme.colors.cyanSoft,
  },
  receiveBadge: {
    backgroundColor: theme.colors.greenSoft,
    borderColor: theme.colors.greenSoft,
  },
  rowMeta: {
    flex: 1,
    gap: theme.spacing.xxs,
  },
  counterparty: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
  },
  amountBlock: {
    alignItems: "flex-end",
  },
  amount: {
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.body,
  },
  amountSend: {
    color: theme.colors.textPrimary,
  },
  amountReceive: {
    color: theme.colors.green,
  },
  symbol: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.micro,
  },
  emptyState: {
    alignItems: "center",
    gap: theme.spacing.sm,
    justifyContent: "center",
    paddingVertical: theme.spacing.huge,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
  },
});
