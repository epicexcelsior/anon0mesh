import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import type { Wallet } from "@/src/domain/entities/Wallet";
import { appTheme as theme } from "@/src/design-system/theme";
import { useLocalDisplayName } from "@/src/hooks/useLocalDisplayName";

function shortAddress(address?: string) {
  if (!address) return "Waiting for wallet address";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

interface HomeHeroProps {
  mode: "fixture" | "local" | "mwa";
  wallet: Wallet | null;
}

function modeLabel(mode: HomeHeroProps["mode"]) {
  switch (mode) {
    case "local":
      return "Local vault";
    case "mwa":
      return "MWA live";
    case "fixture":
      return "Fixture";
  }
}

export function HomeHero({ wallet, mode }: HomeHeroProps) {
  const router = useRouter();
  const walletAlias = wallet?.identity
    ? wallet.identity.length <= 14 ? wallet.identity : `${wallet.identity.slice(0, 10)}…`
    : wallet?.address
      ? `${wallet.address.slice(0, 4)}…${wallet.address.slice(-4)}`
      : "—";
  const { displayName } = useLocalDisplayName(wallet?.address ?? null, walletAlias);

  const alias = displayName || walletAlias;

  return (
    <View style={styles.row}>
      <View style={styles.identityRail}>
        <View style={styles.avatarCircle}>
          <Icon name="identity-chip" size={18} color={theme.colors.cyan} />
        </View>
        <View style={styles.identityCopy}>
          <View style={styles.metaRow}>
            <Text style={styles.kicker}>Wallet</Text>
            <Pill label={modeLabel(mode)} tone="neutral" />
          </View>
          <Text style={styles.alias} numberOfLines={1}>
            {alias}
          </Text>
          <Text style={styles.address} numberOfLines={1}>
            {shortAddress(wallet?.address)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        accessibilityLabel="Show receive QR code"
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => router.push("/receive")}
        style={styles.qrButton}
      >
        <Icon name="maximize" size={18} color={theme.colors.cyan} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  identityRail: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  avatarCircle: {
    alignItems: "center",
    backgroundColor: theme.colors.cyanSoft,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  identityCopy: {
    gap: 2,
    minWidth: 0,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  kicker: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  alias: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.section,
  },
  address: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: theme.type.caption,
  },
  qrButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
});
