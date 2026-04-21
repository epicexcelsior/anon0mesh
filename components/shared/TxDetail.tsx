import React from "react";
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Clipboard from "expo-clipboard";

import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import type { PillTone } from "@/components/primitives/Pill";
import type { Transaction } from "@/src/domain/entities/Transaction";
import type { TransferStatus } from "@/src/domain/status/TransferStatus";
import { getExplorerTransactionUrl } from "@/src/utils/solanaExplorer";
import { appTheme as theme } from "@/src/design-system/theme";

function statusTone(status: TransferStatus): PillTone {
  switch (status) {
    case "Settled":
      return "green";
    case "Handed to mesh":
      return "amber";
    case "Queued on device":
      return "cyan";
    default:
      return "neutral";
  }
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface TxDetailProps {
  tx: Transaction;
}

export function TxDetail({ tx }: TxDetailProps) {
  const isSend = tx.direction === "send";
  const counterparty = isSend ? tx.recipientId : tx.senderId;
  const shortSig = tx.signature
    ? `${tx.signature.slice(0, 8)}...${tx.signature.slice(-4)}`
    : null;

  async function handleCopySig() {
    if (!tx.signature) return;
    try {
      await Clipboard.setStringAsync(tx.signature);
      Alert.alert("Copied!", `${tx.signature.slice(0, 12)}...`);
    } catch {
      Alert.alert("Copied!", `${tx.signature.slice(0, 12)}...`);
    }
  }

  async function handleExplorer() {
    if (process.env.EXPO_PUBLIC_ADAPTERS === "fixtures") {
      Alert.alert("Fixture transfer", "This demo transfer is local fixture data, so there is no live explorer record.");
      return;
    }
    if (!tx.signature) {
      Alert.alert("Explorer not ready", "Explorer link appears once a network signature is available.");
      return;
    }
    await Linking.openURL(getExplorerTransactionUrl(tx.signature));
  }

  return (
    <GlassSurface variant="strong" style={styles.card}>
      {/* Hero amount */}
      <Text style={[styles.heroAmount, isSend ? styles.heroSend : styles.heroReceive]}>
        {isSend ? "-" : "+"}{tx.amount} {tx.symbol}
      </Text>

      {/* Status pill */}
      <Pill label={tx.status} tone={statusTone(tx.status)} style={styles.statusPill} />

      <View style={styles.divider} />

      {/* Details rows */}
      <View style={styles.rows}>
        <DetailRow label={isSend ? "To" : "From"} value={counterparty} mono />

        <DetailRow
          label="Date"
          value={formatDate(tx.createdAt)}
        />

        {tx.settledAt ? (
          <DetailRow
            label="Settled at"
            value={formatDate(tx.settledAt)}
          />
        ) : null}

        {shortSig ? (
          <View style={styles.sigRow}>
            <Text style={styles.rowLabel}>Signature</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCopySig}
              style={styles.sigValue}
            >
              <Text style={[styles.rowValue, styles.mono]}>{shortSig}</Text>
              <Icon name="copy" size={14} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <View style={styles.divider} />

      {/* Explorer CTA */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleExplorer}
        style={styles.explorerBtn}
      >
        <Icon name="external-link" size={14} color={theme.colors.cyan} />
        <Text style={styles.explorerLabel}>View on Explorer</Text>
      </TouchableOpacity>
    </GlassSurface>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <View style={styles.rowItem}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text
        style={[styles.rowValue, mono && styles.mono]}
        numberOfLines={1}
        selectable
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.xl,
    gap: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.xxxl,
  },
  heroAmount: {
    fontFamily: theme.fonts.display,
    fontSize: theme.type.display,
    textAlign: "center",
  },
  heroSend: {
    color: theme.colors.textPrimary,
  },
  heroReceive: {
    color: theme.colors.green,
  },
  statusPill: {
    alignSelf: "center",
  },
  divider: {
    backgroundColor: theme.colors.line,
    height: StyleSheet.hairlineWidth,
    marginHorizontal: -theme.spacing.xxl,
  },
  rows: {
    gap: theme.spacing.md,
  },
  rowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  rowLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    flexShrink: 0,
  },
  rowValue: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
    textAlign: "right",
  },
  mono: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.type.caption,
  },
  sigRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    alignItems: "center",
  },
  sigValue: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    gap: theme.spacing.sm,
    justifyContent: "flex-end",
  },
  explorerBtn: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "center",
    paddingVertical: theme.spacing.xs,
  },
  explorerLabel: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
});
