import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { IconButton } from "@/components/primitives/IconButton";
import type { Wallet } from "@/src/domain/entities/Wallet";
import { appTheme as theme } from "@/src/design-system/theme";
import { useHideBalance } from "@/src/hooks/useHideBalance";
import { useLocalDisplayName } from "@/src/hooks/useLocalDisplayName";

interface HomeHeroProps {
  wallet: Wallet | null;
}

function initialFor(name: string | null | undefined): string {
  if (!name) return "?";
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toUpperCase();
}

// Compact header — identity chip on the left, hide-balance eye + QR
// icon on the right. Keeps the Home screen visual load low so the
// balance hero underneath can dominate.
export function HomeHero({ wallet }: HomeHeroProps) {
  const router = useRouter();
  const { hidden, toggle } = useHideBalance();

  const walletAlias = wallet?.identity
    ? wallet.identity.length <= 14
      ? wallet.identity
      : `${wallet.identity.slice(0, 10)}…`
    : wallet?.address
      ? `${wallet.address.slice(0, 4)}…${wallet.address.slice(-4)}`
      : "—";
  const { displayName } = useLocalDisplayName(wallet?.address ?? null, walletAlias);

  const alias = displayName || walletAlias;

  return (
    <View style={styles.row}>
      <View style={styles.identityRail}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{initialFor(alias)}</Text>
        </View>
        <View style={styles.identityCopy}>
          <Text numberOfLines={1} style={styles.alias}>
            {alias}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <IconButton
          accessibilityLabel={hidden ? "Show balance" : "Hide balance"}
          name={hidden ? "eye-off" : "eye"}
          onPress={toggle}
          size="md"
          tone="neutral"
          variant="contained"
        />
        <IconButton
          accessibilityLabel="Show receive QR code"
          name="maximize"
          onPress={() => router.push("/receive")}
          size="md"
          tone="cyan"
          variant="contained"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  identityRail: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: theme.colors.cyanSoft,
    borderRadius: theme.radius.pill,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  avatarLetter: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.bodyLg,
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
  },
  alias: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.bodyLg,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
});
