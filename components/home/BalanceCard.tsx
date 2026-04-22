import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Pill } from "@/components/primitives/Pill";
import type { Wallet } from "@/src/domain/entities/Wallet";
import type { WalletExportState, WalletMode } from "@/src/domain/services/WalletService";
import { appTheme as theme } from "@/src/design-system/theme";

interface BalanceCardProps {
  exportState: WalletExportState | null;
  loading: boolean;
  mode: WalletMode;
  wallet: Wallet | null;
}

function modeCopy(mode: WalletMode) {
  switch (mode) {
    case "local":
      return "Local vault";
    case "mwa":
      return "External wallet";
    case "fixture":
      return "Fixture lane";
  }
}

function exportCopy(exportState: WalletExportState | null) {
  if (!exportState) return "Loading";
  if (exportState.available) return "Biometric unlock";
  switch (exportState.mode) {
    case "mwa":
      return "Held in wallet app";
    case "fixture":
      return "Unavailable in fixtures";
    case "local":
      return exportState.reason ?? "Unavailable";
  }
}

export function BalanceCard({ exportState, loading, mode, wallet }: BalanceCardProps) {

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

          <View style={styles.supportRow}>
            <View style={styles.supportBlock}>
              <Text style={styles.metricLabel}>Wallet path</Text>
              <Text style={styles.metricValue}>{modeCopy(mode)}</Text>
            </View>
            <View style={styles.supportBlock}>
              <Text style={styles.metricLabel}>Export</Text>
              <Text numberOfLines={2} style={styles.metricValue}>
                {exportCopy(exportState)}
              </Text>
            </View>
          </View>

          <View style={styles.assetRow}>
            <Text style={styles.assetLabel}>Secondary asset</Text>
            <Text style={styles.assetValue}>{usdcBalance?.amount ?? "0.00"} USDC</Text>
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
  supportRow: {
    borderTopColor: theme.colors.line,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.lg,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  supportBlock: {
    flex: 1,
    gap: theme.spacing.xs,
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
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.45,
  },
  assetRow: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  assetLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
  assetValue: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: theme.type.caption,
  },
});
