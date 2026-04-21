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
  const { privacy } = usePreferences();

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
      subtitle="One last check before the transfer is signed and sent."
      title="Review transfer"
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
        <GlassSurface style={styles.heroCard} variant="strong">
          <Text style={styles.heroLabel}>Transfer amount</Text>
          <Text style={styles.heroAmount}>
            {amount} <Text style={styles.heroSymbol}>{symbol}</Text>
          </Text>
          <Text style={styles.heroRouteCopy}>
            This branch submits sends <Text style={styles.heroRouteCopyStrong}>on-chain</Text> today.
          </Text>
        </GlassSurface>

        <GlassSurface style={styles.summaryCard} variant="strong">
          <DetailRow
            icon="user"
            label="Recipient"
            value={matchedPeer?.alias ?? shortAddress(to)}
            secondary={matchedPeer ? shortAddress(to) : undefined}
          />
          <Divider />
          <DetailRow
            icon="activity"
            label="Route"
            valueComponent={<Pill label="On-chain" tone="cyan" />}
          />
          <Divider />
          <DetailRow
            icon="zap"
            label="Estimated fee"
            value="~0.000005 SOL"
          />
          {matchedPeer ? (
            <>
              <Divider />
              <DetailRow
                icon="users"
                label="Nearby peer"
                value={matchedPeer.alias}
                secondary="Selected for recipient convenience only"
              />
            </>
          ) : null}
        </GlassSurface>

        <GlassSurface style={styles.utilityCard} variant="soft">
          <View style={styles.utilityHeader}>
            <View style={styles.utilityCopy}>
              <View style={styles.utilityTitleRow}>
                <Icon
                  color={stealthEnabled ? theme.colors.purple : theme.colors.textMuted}
                  name="stealth"
                  size={16}
                />
                <Text style={[styles.utilityTitle, stealthEnabled && styles.utilityTitleActive]}>
                  Stealth default
                </Text>
              </View>
              <Text style={styles.utilityBody}>
                Saved preference is loaded here, but stealth settlement is still preview-only in this build.
              </Text>
            </View>

            <TouchableOpacity
              accessibilityLabel={stealthEnabled ? "Disable stealth default" : "Enable stealth default"}
              accessibilityRole="button"
              activeOpacity={0.8}
              onPress={() => setStealthEnabled((current) => !current)}
            >
              <Pill
                label={stealthEnabled ? "Preview on" : "Preview off"}
                tone={stealthEnabled ? "purple" : "neutral"}
              />
            </TouchableOpacity>
          </View>
        </GlassSurface>

        <GlassSurface style={styles.noteCard} variant="soft">
          <View style={styles.noteRow}>
            <Icon color={theme.colors.cyan} name="info" size={16} />
            <Text style={styles.noteText}>
              Mesh relay integration is being landed separately. This redesigned send flow stays on-chain until that work is ready.
            </Text>
          </View>
        </GlassSurface>

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

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  heroCard: {
    alignItems: "center",
    borderRadius: theme.radius.xl,
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xxl,
  },
  heroLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.7,
    textTransform: "uppercase",
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
  heroRouteCopy: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.6,
    textAlign: "center",
  },
  heroRouteCopyStrong: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.bodyMedium,
  },
  summaryCard: {
    borderRadius: theme.radius.xl,
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
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
  divider: {
    backgroundColor: theme.colors.line,
    height: StyleSheet.hairlineWidth,
  },
  utilityCard: {
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  utilityHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
  },
  utilityCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  utilityTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  utilityTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.bodyLg,
  },
  utilityTitleActive: {
    color: theme.colors.purple,
  },
  utilityBody: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.6,
  },
  noteCard: {
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  noteRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  noteText: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.6,
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
