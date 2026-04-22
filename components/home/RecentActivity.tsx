import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import type { PillTone } from "@/components/primitives/Pill";
import { PressSurface } from "@/components/primitives/PressSurface";
import type { Transaction } from "@/src/domain/entities/Transaction";
import { appTheme as theme } from "@/src/design-system/theme";
import { useHideBalance } from "@/src/hooks/useHideBalance";
import { useTransaction } from "@/src/hooks/useTransaction";
import type { TransferStatus } from "@/src/domain/status/TransferStatus";

const DEFAULT_LIMIT = 5;
const HIDDEN_AMOUNT = "•••";

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

function ActivityRow({
  hidden,
  onPress,
  tx,
}: {
  hidden: boolean;
  onPress: () => void;
  tx: Transaction;
}) {
  const isSend = tx.direction === "send";
  const counterparty = isSend ? tx.recipientId : tx.senderId;
  const shortCounterparty =
    counterparty.length > 14
      ? `${counterparty.slice(0, 8)}…${counterparty.slice(-4)}`
      : counterparty;

  const amountText = hidden ? HIDDEN_AMOUNT : `${isSend ? "-" : "+"}${tx.amount}`;

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
          <Text numberOfLines={1} style={styles.counterparty}>
            {shortCounterparty}
          </Text>
          <Text style={styles.timestamp}>{relativeTime(tx.createdAt)}</Text>
        </View>

        <View style={styles.amountBlock}>
          <Text
            numberOfLines={1}
            style={[styles.amount, isSend ? styles.amountSend : styles.amountReceive]}
          >
            {amountText}
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

interface RecentActivityProps {
  limit?: number;
}

// Trimmed list — up to `limit` recent transactions (default 5) rendered
// inline, no ScrollView. The parent Home ScrollView handles overflow.
// If more transactions exist, the caller decides whether to show a
// "See all" link; this component just renders its slice of rows.
export function RecentActivity({ limit = DEFAULT_LIMIT }: RecentActivityProps) {
  const router = useRouter();
  const { hidden } = useHideBalance();
  const { recent, loading } = useTransaction();

  if (loading && recent.length === 0) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="small" color={theme.colors.cyan} />
        <Text style={styles.emptyText}>Loading activity…</Text>
      </View>
    );
  }

  const sorted = [...recent].sort((left, right) => right.createdAt - left.createdAt);
  const visible = sorted.slice(0, limit);

  if (visible.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Icon name="inbox" size={24} color={theme.colors.textMuted} />
        <Text style={styles.emptyText}>No recent activity yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {visible.map((tx) => (
        <ActivityRow
          hidden={hidden}
          key={tx.id}
          onPress={() => router.push({ pathname: "/history/[txId]", params: { txId: tx.id } })}
          tx={tx}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: theme.spacing.xs,
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
    height: 38,
    justifyContent: "center",
    width: 38,
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
    fontSize: 14,
  },
  timestamp: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  amountBlock: {
    alignItems: "flex-end",
    gap: 2,
  },
  amount: {
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: 17,
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
    paddingVertical: theme.spacing.xxxl,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
  },
});
