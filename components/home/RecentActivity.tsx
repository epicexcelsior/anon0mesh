import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import type { PillTone } from "@/components/primitives/Pill";
import { PressSurface } from "@/components/primitives/PressSurface";
import type { Transaction } from "@/src/domain/entities/Transaction";
import { appTheme as theme } from "@/src/design-system/theme";
import { useTransaction } from "@/src/hooks/useTransaction";
import type { TransferStatus } from "@/src/domain/status/TransferStatus";

const LIST_BOTTOM_PADDING = theme.component.nav.barHeight + theme.spacing.xxxl;

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

function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function ActivityRow({ onPress, tx }: { onPress: () => void; tx: Transaction }) {
  const isSend = tx.direction === "send";
  const counterparty = isSend ? tx.recipientId : tx.senderId;
  const shortCounterparty =
    counterparty.length > 14
      ? `${counterparty.slice(0, 8)}...${counterparty.slice(-4)}`
      : counterparty;

  return (
    <PressSurface
      accessibilityLabel={`Open ${isSend ? "sent" : "received"} transaction detail`}
      onPress={onPress}
      style={styles.row}
      variant="row"
    >
      <View style={styles.inner}>
        <View style={[styles.directionBadge, isSend ? styles.sendBadge : styles.receiveBadge]}>
          <Icon
            name={isSend ? "arrow-up-right" : "arrow-down-left"}
            size={14}
            color={isSend ? theme.colors.cyan : theme.colors.green}
          />
        </View>

        <View style={styles.rowMeta}>
          <Text style={styles.counterparty} numberOfLines={1}>
            {shortCounterparty}
          </Text>
          <Text style={styles.timestamp}>{relativeTime(tx.createdAt)}</Text>
        </View>

        <View style={styles.amountBlock}>
          <Text style={[styles.amount, isSend ? styles.amountSend : styles.amountReceive]}>
            {isSend ? "-" : "+"}
            {tx.amount}
          </Text>
          <View style={styles.statusRow}>
            <Text style={styles.symbol}>{tx.symbol}</Text>
            <Pill label={tx.status} tone={statusTone(tx.status)} />
          </View>
        </View>
      </View>
    </PressSurface>
  );
}

export function RecentActivity() {
  const router = useRouter();
  const { recent, loading } = useTransaction();
  const sorted = [...recent].sort((left, right) => right.createdAt - left.createdAt);

  if (loading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="small" color={theme.colors.cyan} />
        <Text style={styles.emptyText}>Loading activity…</Text>
      </View>
    );
  }

  if (sorted.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Icon name="inbox" size={24} color={theme.colors.textMuted} />
        <Text style={styles.emptyText}>No recent activity</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      style={styles.scroll}
    >
      {sorted.map((tx) => (
        <ActivityRow
          key={tx.id}
          onPress={() => router.push({ pathname: "/history/[txId]", params: { txId: tx.id } })}
          tx={tx}
        />
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
    paddingBottom: LIST_BOTTOM_PADDING,
  },
  row: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
  },
  inner: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  directionBadge: {
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
  rowMeta: {
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
  amountBlock: {
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
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
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
