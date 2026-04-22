import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import type { Wallet } from "@/src/domain/entities/Wallet";
import { appTheme as theme } from "@/src/design-system/theme";
import { useHideBalance } from "@/src/hooks/useHideBalance";

interface BalanceCardProps {
  loading: boolean;
  wallet: Wallet | null;
}

const HIDDEN_AMOUNT = "••••";
const HIDDEN_USD = "•••";

function formatAmount(amount: string | undefined): string {
  if (!amount) return "—";
  // Trim trailing zeros after the decimal for a cleaner hero read:
  //   "1.245000" → "1.245", "1.000000" → "1", "0.500000" → "0.5"
  if (!amount.includes(".")) return amount;
  const trimmed = amount.replace(/0+$/, "").replace(/\.$/, "");
  return trimmed || "0";
}

// Minimal balance hero — caption + large SOL amount + small USD below.
// Hide-balance state comes from HideBalanceProvider; header eye and a
// long-press anywhere on the hero both toggle the same value.
export function BalanceCard({ loading, wallet }: BalanceCardProps) {
  const { hidden, toggle } = useHideBalance();
  const solBalance = wallet?.balances.find((b) => b.symbol === "SOL");

  const amountText = hidden ? HIDDEN_AMOUNT : formatAmount(solBalance?.amount);
  const usdText = hidden ? HIDDEN_USD : (solBalance?.usdValue ?? "$0.00");

  if (loading && !wallet) {
    return (
      <View style={styles.hero}>
        <Text style={styles.caption}>Total balance</Text>
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={theme.colors.cyan} />
          <Text style={styles.loadingText}>Loading wallet…</Text>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={hidden ? "Reveal balance" : "Hide balance"}
      accessibilityRole="button"
      onLongPress={toggle}
      delayLongPress={280}
      style={styles.hero}
    >
      <Text style={styles.caption}>Total balance</Text>
      <View style={styles.amountRow}>
        <Text style={styles.amount} numberOfLines={1}>
          {amountText}
        </Text>
        <Text style={styles.symbol}>SOL</Text>
      </View>
      <Text style={styles.usd} numberOfLines={1}>
        {usdText}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.lg,
  },
  caption: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  amountRow: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  amount: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: 48,
    letterSpacing: -1.4,
  },
  symbol: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.heading,
    fontSize: 20,
    letterSpacing: -0.4,
  },
  usd: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: 19,
    marginTop: theme.spacing.xxs,
  },
  loadingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
  },
  loadingText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
});
