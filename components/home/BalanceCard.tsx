import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Pill } from "@/components/primitives/Pill";
import { appTheme as theme } from "@/src/design-system/theme";
import { useWallet } from "@/src/hooks/useWallet";

function shortAddress(address?: string) {
  if (!address) return "—";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function BalanceCard() {
  const { wallet, loading } = useWallet();

  const solBalance = wallet?.balances.find((balance) => balance.symbol === "SOL");
  const usdcBalance = wallet?.balances.find((balance) => balance.symbol === "USDC");

  return (
    <GlassSurface variant="strong" style={styles.card}>
      {loading && !wallet ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color={theme.colors.cyan} />
          <Text style={styles.loadingText}>Loading wallet…</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <Text style={styles.kicker}>Total balance</Text>
              <View style={styles.heroRow}>
                <Text style={styles.heroAmount}>{solBalance ? solBalance.amount : "—"}</Text>
                <Text style={styles.heroSymbol}>SOL</Text>
              </View>
            </View>
            <Pill label={wallet ? "Wallet live" : "Loading"} tone={wallet ? "cyan" : "neutral"} />
          </View>

          <Text style={styles.usdValue}>{solBalance ? solBalance.usdValue : "$0.00"}</Text>

          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Address</Text>
              <Text style={styles.metricValue}>{shortAddress(wallet?.address)}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>USDC</Text>
              <Text style={styles.metricValue}>{usdcBalance?.amount ?? "0.00"}</Text>
            </View>
          </View>
        </View>
      )}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.component.recipes.heroCardRadius,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    overflow: "hidden",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  loadingState: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "center",
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
  content: {
    gap: theme.spacing.sm,
  },
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerCopy: {
    gap: theme.spacing.xs,
  },
  kicker: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  heroRow: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  heroAmount: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: theme.type.hero,
    letterSpacing: -1.1,
  },
  heroSymbol: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.bodyLg,
    letterSpacing: -0.5,
  },
  usdValue: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
  },
  metricsRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  metricCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flex: 1,
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  metricLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  metricValue: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: theme.type.caption,
  },
});
