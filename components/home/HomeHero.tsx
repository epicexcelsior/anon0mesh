import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any;

import { Icon } from "@/components/primitives/Icon";
import { useWallet } from "@/src/hooks/useWallet";
import { appTheme as theme } from "@/src/design-system/theme";

export function HomeHero() {
  const router = useRouter();
  const { wallet } = useWallet();

  const alias = wallet?.identity
    ? wallet.identity.length <= 14 ? wallet.identity : wallet.identity.slice(0, 10) + "…"
    : wallet?.address
    ? wallet.address.slice(0, 4) + "…" + wallet.address.slice(-4)
    : "—";

  return (
    <View style={styles.row}>
      {/* Identity chip — left */}
      <View style={styles.identityChip}>
        <View style={styles.avatarCircle}>
          <Icon name="identity-chip" size={18} color={theme.colors.cyan} />
        </View>
        <Text style={styles.alias} numberOfLines={1}>
          {alias}
        </Text>
      </View>

      {/* QR / Receive icon — right */}
      <TouchableOpacity
        accessibilityLabel="Show receive QR code"
        accessibilityRole="button"
        onPress={() => router.push("/receive" as AnyHref)}
        style={styles.qrButton}
        hitSlop={8}
      >
        <Icon name="maximize" size={20} color={theme.colors.textSecondary} />
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
    paddingVertical: theme.spacing.sm,
  },
  identityChip: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  avatarCircle: {
    alignItems: "center",
    backgroundColor: theme.colors.cyanSoft,
    borderColor: theme.colors.cyanSoft,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  alias: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  qrButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xs,
  },
});
