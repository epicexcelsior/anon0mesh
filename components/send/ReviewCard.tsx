import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import { SendScaffold } from "@/components/send/SendScaffold";
import SlideToConfirm from "@/components/primitives/SlideToConfirm";
import { appTheme as theme } from "@/src/design-system/theme";
import { usePeers } from "@/src/hooks/usePeers";
import { usePreferences } from "@/src/hooks/usePreferences";
import { useAdapters } from "@/src/providers/AdapterProvider";

function shortAddress(addr: string): string {
  if (!addr || addr.length <= 14) return addr;
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
  const { privacy, updatePrivacy } = usePreferences();

  const [stealthEnabled, setStealthEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [sliderResetKey, setSliderResetKey] = useState(0);

  const matchedPeer = useMemo(
    () => peers.find((peer) => peer.publicKey === to),
    [peers, to],
  );

  useEffect(() => {
    setStealthEnabled(privacy.stealthByDefault);
  }, [privacy.stealthByDefault]);

  async function handleConfirm() {
    if (isConfirming) return;

    setError(null);
    setIsConfirming(true);

    try {
      const tx = await adapters.wallet.send({
        amount,
        recipientAddress: to,
        symbol,
      });

      router.push({
        pathname: "/send/success",
        params: {
          amount,
          symbol,
          txId: tx.id,
        },
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Send failed");
      setSliderResetKey((current) => current + 1);
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <SendScaffold
      onBack={() => router.back()}
      step={3}
      title="Review"
      footer={
        <SlideToConfirm
          key={sliderResetKey}
          label={`Slide to send ${amount} ${symbol}`}
          onComplete={handleConfirm}
        />
      }
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroBlock}>
          <Text style={styles.heroAmount}>
            {amount} <Text style={styles.heroSymbol}>{symbol}</Text>
          </Text>
        </View>

        <GlassSurface style={styles.summaryCard} variant="strong">
          <DetailRow
            icon="user"
            label="To"
            value={matchedPeer?.alias ?? shortAddress(to)}
            secondary={matchedPeer ? shortAddress(to) : undefined}
          />
          <DetailRow
            icon="activity"
            label="Route"
            valueComponent={<Pill label="On-chain" tone="cyan" />}
          />
          <DetailRow
            icon="zap"
            label="Fee"
            value="~0.000005 SOL"
          />
        </GlassSurface>

        <TouchableOpacity
          accessibilityLabel={stealthEnabled ? "Disable stealth default" : "Enable stealth default"}
          accessibilityRole="button"
          activeOpacity={0.8}
          onPress={() => {
            const next = !stealthEnabled;
            setStealthEnabled(next);
            void updatePrivacy({ stealthByDefault: next });
          }}
          style={styles.stealthRow}
        >
          <View style={styles.stealthLabelBlock}>
            <Icon
              color={stealthEnabled ? theme.colors.purple : theme.colors.textMuted}
              name="eye-off"
              size={16}
            />
            <Text style={[styles.stealthLabel, stealthEnabled && styles.stealthLabelActive]}>
              Stealth
            </Text>
          </View>
          <Pill
            label={stealthEnabled ? "On" : "Off"}
            tone={stealthEnabled ? "purple" : "neutral"}
          />
        </TouchableOpacity>

        {error ? (
          <View style={styles.errorRow}>
            <Icon color={theme.colors.red} name="alert-circle" size={14} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SendScaffold>
  );
}

function DetailRow({
  icon,
  label,
  secondary,
  value,
  valueComponent,
}: {
  icon: React.ComponentProps<typeof Icon>["name"];
  label: string;
  secondary?: string;
  value?: string;
  valueComponent?: React.ReactNode;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLabelBlock}>
        <Icon color={theme.colors.textMuted} name={icon} size={16} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>

      <View style={styles.detailValueBlock}>
        {valueComponent ?? (
          <Text numberOfLines={1} style={styles.detailValue}>
            {value}
          </Text>
        )}
        {secondary ? (
          <Text numberOfLines={1} style={styles.detailSecondary}>
            {secondary}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  heroBlock: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  heroAmount: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.display,
    fontSize: theme.type.hero,
    letterSpacing: -1.4,
    textAlign: "center",
  },
  heroSymbol: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.bodyLg,
  },
  summaryCard: {
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 56,
  },
  detailLabelBlock: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  detailLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
  },
  detailValueBlock: {
    alignItems: "flex-end",
    flexShrink: 1,
    gap: 2,
    marginLeft: theme.spacing.md,
  },
  detailValue: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
    maxWidth: 180,
    textAlign: "right",
  },
  detailSecondary: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.micro,
    maxWidth: 220,
    textAlign: "right",
  },
  stealthRow: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  stealthLabelBlock: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  stealthLabel: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  stealthLabelActive: {
    color: theme.colors.purple,
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
});
