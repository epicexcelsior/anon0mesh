import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { GlassSurface } from "@/components/primitives/GlassSurface";
import { useWallet } from "@/src/hooks/useWallet";
import { appTheme as theme } from "@/src/design-system/theme";

export function BalanceCard() {
  const { wallet, loading } = useWallet();

  const solBalance = wallet?.balances.find((b) => b.symbol === "SOL");
  const usdcBalance = wallet?.balances.find((b) => b.symbol === "USDC");

  return (
    <GlassSurface variant="strong" style={styles.card}>
      {loading && !wallet ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color={theme.colors.cyan} />
          <Text style={styles.loadingText}>Loading wallet…</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* SOL hero balance */}
          <View style={styles.heroRow}>
            <Text style={styles.heroAmount}>
              {solBalance ? solBalance.amount : "—"}
            </Text>
            <Text style={styles.heroSymbol}> SOL</Text>
          </View>

          {/* USD value */}
          <Text style={styles.usdValue}>
            {solBalance ? solBalance.usdValue : "$0.00"}
          </Text>

          {/* Secondary: USDC balance */}
          {usdcBalance && (
            <View style={styles.secondaryRow}>
              <Text style={styles.secondaryLabel}>USDC</Text>
              <Text style={styles.secondaryAmount}>{usdcBalance.amount}</Text>
            </View>
          )}

          {/* Truncated address */}
          {wallet?.address && (
            <Text style={styles.address} numberOfLines={1}>
              {wallet.address}
            </Text>
          )}
        </View>
      )}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    overflow: "hidden",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
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
    gap: theme.spacing.xs,
  },
  heroRow: {
    alignItems: "baseline",
    flexDirection: "row",
  },
  heroAmount: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.hero,
    letterSpacing: -1,
  },
  heroSymbol: {
    color: theme.colors.textTertiary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.title,
    letterSpacing: -0.5,
  },
  usdValue: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
    marginTop: theme.spacing.xxs,
  },
  secondaryRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  secondaryLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
  },
  secondaryAmount: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
  },
  address: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: theme.type.micro,
    letterSpacing: 0.3,
    marginTop: theme.spacing.md,
    opacity: 0.7,
  },
});
