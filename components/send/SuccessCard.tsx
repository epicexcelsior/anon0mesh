import React from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Backdrop } from "@/components/primitives/Backdrop";
import { DepthButton } from "@/components/primitives/DepthButton";
import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import { appTheme as theme } from "@/src/design-system/theme";

function shortSig(id: string): string {
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

interface SuccessCardProps {
  txId: string;
  amount: string;
  symbol: string;
}

export function SuccessCard({ txId, amount, symbol }: SuccessCardProps) {
  const router = useRouter();

  async function handleCopyTxId() {
    await Clipboard.setStringAsync(txId);
    Alert.alert("Copied", "Transaction ID copied to clipboard.");
  }

  function handleDone() {
    router.replace("/(tabs)/home" as Parameters<typeof router.replace>[0]);
  }

  function handleViewExplorer() {
    Alert.alert("Coming soon", "Transaction explorer integration is coming in a future update.");
  }

  function handleShareReceipt() {
    Alert.alert("Coming soon", "Receipt sharing is coming in a future update.");
  }

  return (
    <View style={styles.root}>
      <Backdrop preset="success" />

      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.content}>
          {/* Check icon */}
          <View style={styles.iconWrap}>
            <Icon name="check-circle" size={72} color={theme.colors.green} />
          </View>

          {/* Amount hero */}
          <Text style={styles.heroAmount}>
            {amount} {symbol}
          </Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>Sent successfully</Text>

          {/* Status pill */}
          <Pill label="Queued on device" tone="cyan" style={styles.pill} />

          {/* Tx signature */}
          {txId ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCopyTxId}
              style={styles.sigRow}
            >
              <Text style={styles.sigText}>{shortSig(txId)}</Text>
              <Icon name="copy" size={14} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <DepthButton
            label="Done"
            onPress={handleDone}
            tone="green"
            variant="success"
          />

          <View style={styles.secondaryActions}>
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={8}
              onPress={handleViewExplorer}
              style={styles.ghostBtn}
            >
              <Icon name="external-link" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.ghostBtnText}>View on Explorer</Text>
            </TouchableOpacity>

            <View style={styles.actionDot} />

            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={8}
              onPress={handleShareReceipt}
              style={styles.ghostBtn}
            >
              <Icon name="share" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.ghostBtnText}>Share Receipt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    alignItems: "center",
    flex: 1,
    gap: theme.spacing.lg,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xxxl,
  },
  iconWrap: {
    marginBottom: theme.spacing.sm,
  },
  heroAmount: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.heroLg,
    letterSpacing: -2,
    textAlign: "center",
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.bodyLg,
    textAlign: "center",
  },
  pill: {
    marginTop: theme.spacing.xs,
  },
  sigRow: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.lineStrong,
    borderRadius: theme.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  sigText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: theme.type.caption,
  },
  actions: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  secondaryActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "center",
  },
  ghostBtn: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  ghostBtnText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
  actionDot: {
    backgroundColor: theme.colors.textMuted,
    borderRadius: theme.radius.pill,
    height: 3,
    width: 3,
  },
});
