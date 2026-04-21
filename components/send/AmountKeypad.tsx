import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import NumericKeypad from "@/components/primitives/NumericKeypad";
import { DepthButton } from "@/components/primitives/DepthButton";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { SendScaffold } from "@/components/send/SendScaffold";
import { appTheme as theme } from "@/src/design-system/theme";
import { usePeers } from "@/src/hooks/usePeers";
import { useWallet } from "@/src/hooks/useWallet";

const SOL_USD_RATE = 160;

function shortAddress(addr: string) {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-4)}`;
}

export function AmountKeypad() {
  const router = useRouter();
  const { to } = useLocalSearchParams<{ to: string }>();
  const { peers } = usePeers();
  const { wallet } = useWallet();
  const [amount, setAmount] = useState("0");

  const recipient = typeof to === "string" ? to : "";
  const matchedPeer = useMemo(
    () => peers.find((peer) => peer.publicKey === recipient),
    [peers, recipient],
  );

  useEffect(() => {
    if (!recipient) {
      router.replace("/send/recipient");
    }
  }, [recipient, router]);

  const solBalance =
    wallet?.balances.find((balance) => balance.symbol === "SOL")?.amount ?? "0";
  const balanceNum = parseFloat(solBalance) || 0;
  const amountNum = parseFloat(amount) || 0;
  const usdEquiv = (amountNum * SOL_USD_RATE).toFixed(2);
  const isValid = amountNum > 0 && amountNum <= balanceNum && Boolean(recipient);

  function handleNext() {
    if (!isValid) return;
    router.push({
      pathname: "/send/review",
      params: {
        amount,
        symbol: "SOL",
        to: recipient,
      },
    });
  }

  return (
    <SendScaffold
      onBack={() => router.back()}
      step={2}
      subtitle="Set the transfer size. The USD value below is a local estimate for now."
      title="Set amount"
      footer={
        <DepthButton
          disabled={!isValid}
          label="Review transfer"
          onPress={handleNext}
          tone="cyan"
          variant="primary"
        />
      }
    >
      <View style={styles.content}>
        <GlassSurface style={styles.summaryCard} variant="strong">
          <View style={styles.summaryCopy}>
            <Text style={styles.kicker}>Sending to</Text>
            <Text numberOfLines={1} style={styles.recipientName}>
              {matchedPeer?.alias ?? "Wallet address"}
            </Text>
            <Text numberOfLines={1} style={styles.recipientAddress}>
              {shortAddress(recipient)}
            </Text>
          </View>

          <View style={styles.balanceChip}>
            <Text style={styles.balanceLabel}>Available</Text>
            <Text style={styles.balanceValue}>{balanceNum.toFixed(4)} SOL</Text>
          </View>
        </GlassSurface>

        <View style={styles.keypadSection}>
          <NumericKeypad
            currency="SOL"
            fiatLabel={`Estimate only · ≈ $${usdEquiv}`}
            maxAmount={balanceNum.toFixed(4)}
            onChangeValue={setAmount}
            showMaxChip
            value={amount}
          />
        </View>

        {amountNum > balanceNum ? (
          <View style={styles.feedbackRow}>
            <Icon color={theme.colors.red} name="alert-circle" size={14} />
            <Text style={styles.feedbackText}>Amount exceeds current SOL balance.</Text>
          </View>
        ) : (
          <Text style={styles.footnote}>
            Balance is live from the current wallet. Price conversion stays local until quote wiring lands.
          </Text>
        )}
      </View>
    </SendScaffold>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  summaryCard: {
    alignItems: "center",
    borderRadius: theme.radius.xl,
    flexDirection: "row",
    gap: theme.spacing.lg,
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  summaryCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  kicker: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  recipientName: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.bodyLg,
  },
  recipientAddress: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: theme.type.caption,
  },
  balanceChip: {
    alignItems: "flex-end",
    backgroundColor: theme.colors.cyanSoft,
    borderColor: theme.colors.cyanGlow,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    minWidth: 120,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  balanceLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  balanceValue: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: theme.type.caption,
    marginTop: theme.spacing.xxs,
  },
  keypadSection: {
    flex: 1,
    justifyContent: "center",
    paddingTop: theme.spacing.lg,
  },
  feedbackRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
    justifyContent: "center",
    paddingBottom: theme.spacing.sm,
  },
  feedbackText: {
    color: theme.colors.red,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
  footnote: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.55,
    paddingBottom: theme.spacing.sm,
    textAlign: "center",
  },
});
