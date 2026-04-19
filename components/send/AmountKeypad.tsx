import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";

import { Backdrop } from "@/components/primitives/Backdrop";
import { DepthButton } from "@/components/primitives/DepthButton";
import { Icon } from "@/components/primitives/Icon";
import NumericKeypad from "@/components/primitives/NumericKeypad";
import { useWallet } from "@/src/hooks/useWallet";
import { appTheme as theme } from "@/src/design-system/theme";

const SOL_USD_RATE = 160; // fixture rate: 1 SOL ≈ $160

export function AmountKeypad() {
  const router = useRouter();
  const { to } = useLocalSearchParams<{ to: string }>();
  const { wallet } = useWallet();

  const [amount, setAmount] = useState("0");

  const solBalance =
    wallet?.balances.find((b) => b.symbol === "SOL")?.amount ?? "0";
  const balanceNum = parseFloat(solBalance);
  const amountNum = parseFloat(amount) || 0;
  const usdEquiv = (amountNum * SOL_USD_RATE).toFixed(2);

  const isValid = amountNum > 0 && amountNum <= balanceNum;

  function handleNext() {
    if (!isValid || !to) return;
    router.push(
      (`/send/review?to=${encodeURIComponent(to)}&amount=${encodeURIComponent(amount)}&symbol=SOL`) as Parameters<typeof router.push>[0]
    );
  }

  return (
    <View style={styles.root}>
      <Backdrop preset="send" />

      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={8}
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Icon name="arrow-left" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Amount</Text>

          {/* Balance chip */}
          <View style={styles.balanceChip}>
            <Text style={styles.balanceText} numberOfLines={1}>
              {parseFloat(solBalance).toFixed(4)} SOL
            </Text>
          </View>
        </View>

        {/* Keypad with integrated display */}
        <View style={styles.keypadWrap}>
          <NumericKeypad
            currency="SOL"
            fiatLabel={`≈ $${usdEquiv}`}
            maxAmount={parseFloat(solBalance).toFixed(4)}
            onChangeValue={setAmount}
            showMaxChip
            value={amount}
          />
        </View>

        {/* Validation message */}
        {amountNum > balanceNum && (
          <View style={styles.errorRow}>
            <Icon name="alert-circle" size={14} color={theme.colors.red} />
            <Text style={styles.errorText}>Exceeds balance</Text>
          </View>
        )}

        {/* CTA */}
        <View style={styles.footer}>
          <DepthButton
            disabled={!isValid}
            label="Next"
            onPress={handleNext}
            tone="cyan"
            variant="primary"
          />
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
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.section,
  },
  backBtn: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  balanceChip: {
    backgroundColor: theme.colors.cyanSoft,
    borderColor: theme.colors.cyanGlow,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    maxWidth: 120,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xxs,
  },
  balanceText: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: theme.type.caption,
  },
  keypadWrap: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: theme.spacing.md,
  },
  errorRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
    justifyContent: "center",
    paddingBottom: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.red,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
  footer: {
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
});
