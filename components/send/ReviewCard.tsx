import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Backdrop } from "@/components/primitives/Backdrop";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import SlideToConfirm from "@/components/primitives/SlideToConfirm";
import { usePeers } from "@/src/hooks/usePeers";
import { useAdapters } from "@/src/providers/AdapterProvider";
import { appTheme as theme } from "@/src/design-system/theme";

function shortAddress(addr: string): string {
  if (!addr || addr.length <= 12) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-4)}`;
}

interface ReviewCardProps {
  to: string;
  amount: string;
  symbol: string;
}

export function ReviewCard({ to, amount, symbol }: ReviewCardProps) {
  const router = useRouter();
  const adapters = useAdapters();
  const { peers } = usePeers();

  const [stealthEnabled, setStealthEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const matchedPeer = peers.find((p) => p.publicKey === to);
  const isMeshPeer = Boolean(matchedPeer);
  const route = isMeshPeer ? "Mesh-relayed" : "On-chain";

  async function handleConfirm() {
    if (isConfirming) return;
    setIsConfirming(true);
    setError(null);

    try {
      const tx = await adapters.wallet.send({
        recipientAddress: to,
        amount,
        symbol,
      });
      router.push(
        (`/send/success?txId=${encodeURIComponent(tx.id)}&amount=${encodeURIComponent(amount)}&symbol=${encodeURIComponent(symbol)}`) as Parameters<typeof router.push>[0]
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Send failed";
      setError(msg);
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <View style={styles.root}>
      <Backdrop preset="send" />

      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityLabel="Back"
            accessibilityRole="button"
            activeOpacity={0.7}
            hitSlop={8}
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Icon name="arrow-left" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review</Text>
          <View style={styles.backBtn} />
        </View>

        <View style={styles.content}>
          {/* Review card */}
          <GlassSurface variant="strong" style={styles.card}>
            {/* Recipient row */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Icon name="user" size={16} color={theme.colors.textMuted} />
                <Text style={styles.rowLabel}>Recipient</Text>
              </View>
              <View style={styles.rowRight}>
                {matchedPeer && (
                  <Text style={styles.rowValueAccent}>{matchedPeer.alias}</Text>
                )}
                <Text style={styles.rowValueMono} numberOfLines={1}>
                  {shortAddress(to)}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Amount row */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Icon name="send" size={16} color={theme.colors.textMuted} />
                <Text style={styles.rowLabel}>Amount</Text>
              </View>
              <Text style={styles.rowValueLarge}>
                {amount}{" "}
                <Text style={styles.rowValueSymbol}>{symbol}</Text>
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Fee row */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Icon name="zap" size={16} color={theme.colors.textMuted} />
                <Text style={styles.rowLabel}>Network fee</Text>
              </View>
              <Text style={styles.rowValue}>~0.000005 SOL</Text>
            </View>

            <View style={styles.divider} />

            {/* Route row */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Icon name="share-2" size={16} color={theme.colors.textMuted} />
                <Text style={styles.rowLabel}>Route</Text>
              </View>
              <Pill
                label={route}
                tone={isMeshPeer ? "amber" : "neutral"}
              />
            </View>

            <View style={styles.divider} />

            {/* Stealth toggle row */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Icon name="stealth" size={16} color={stealthEnabled ? theme.colors.purple : theme.colors.textMuted} />
                <Text style={[styles.rowLabel, stealthEnabled && styles.rowLabelPurple]}>
                  Stealth
                </Text>
              </View>
              <TouchableOpacity
                accessibilityLabel={stealthEnabled ? "Disable stealth" : "Enable stealth"}
                accessibilityRole="button"
                activeOpacity={0.8}
                hitSlop={12}
                onPress={() => setStealthEnabled((v) => !v)}
              >
                <Pill
                  label={stealthEnabled ? "On" : "Off"}
                  tone={stealthEnabled ? "purple" : "neutral"}
                />
              </TouchableOpacity>
            </View>
          </GlassSurface>

          {/* Error message */}
          {error && (
            <View style={styles.errorRow}>
              <Icon name="alert-circle" size={14} color={theme.colors.red} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        {/* Slide to confirm */}
        <View style={styles.footer}>
          <SlideToConfirm
            label={`Slide to send ${amount} ${symbol}`}
            onComplete={handleConfirm}
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
  content: {
    flex: 1,
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
  },
  card: {
    borderRadius: theme.radius.lg,
    gap: theme.spacing.xs,
    padding: theme.spacing.lg,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
  },
  rowLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  rowRight: {
    alignItems: "flex-end",
    gap: theme.spacing.xxs,
  },
  rowLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
  },
  rowLabelPurple: {
    color: theme.colors.purple,
  },
  rowValue: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  rowValueAccent: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
  },
  rowValueMono: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.mono,
    fontSize: theme.type.caption,
    maxWidth: 160,
  },
  rowValueLarge: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.title,
  },
  rowValueSymbol: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.section,
  },
  divider: {
    backgroundColor: theme.colors.line,
    height: StyleSheet.hairlineWidth,
  },
  errorRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
    justifyContent: "center",
  },
  errorText: {
    color: theme.colors.red,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
  footer: {
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
});
