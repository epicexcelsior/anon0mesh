import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Alert,
  Linking,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { DepthButton } from "@/components/primitives/DepthButton";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import { SendScaffold } from "@/components/send/SendScaffold";
import * as haptics from "@/src/design-system/haptics";
import * as sound from "@/src/design-system/sound";
import { appTheme as theme } from "@/src/design-system/theme";
import { useTransaction } from "@/src/hooks";
import { getExplorerTransactionUrl } from "@/src/utils/solanaExplorer";

function shortReference(id: string) {
  if (id.length <= 18) return id;
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

interface SuccessCardProps {
  txId: string;
  amount: string;
  symbol: string;
}

export function SuccessCard({ txId, amount, symbol }: SuccessCardProps) {
  const router = useRouter();
  const { selected: transaction } = useTransaction(txId);

  const displayReference = transaction?.signature ?? txId;
  const statusLabel = transaction?.status ?? "Queued on device";
  const settled = statusLabel === "Settled";
  const title = settled ? "Transfer settled" : "Transfer in motion";
  const subtitle = settled
    ? "Receipt attached and ready to share."
    : "Receipt is live now. Explorer state can lag until settlement catches up.";

  useEffect(() => {
    sound.successResolve();
    haptics.confirm();
  }, []);

  async function handleCopyReference() {
    await Clipboard.setStringAsync(displayReference);
    Alert.alert("Copied", "Transfer reference copied to clipboard.");
  }

  function handleDone() {
    router.replace("/(tabs)/home");
  }

  async function handleViewExplorer() {
    if (process.env.EXPO_PUBLIC_ADAPTERS === "fixtures") {
      Alert.alert(
        "Fixture transfer",
        "This demo transfer is local fixture data, so there is no live explorer record.",
      );
      return;
    }

    if (!transaction?.signature) {
      Alert.alert(
        "Explorer not ready",
        "Explorer link appears once a network signature is available.",
      );
      return;
    }

    await Linking.openURL(getExplorerTransactionUrl(transaction.signature));
  }

  async function handleShareReceipt() {
    const lines = [
      "AnonMesh transfer receipt",
      `Amount: ${amount} ${symbol}`,
      `Status: ${statusLabel}`,
      "Route: On-chain",
      `Reference: ${displayReference}`,
    ];

    if (transaction?.signature) {
      lines.push(`Explorer: ${getExplorerTransactionUrl(transaction.signature)}`);
    }

    await Share.share({ message: lines.join("\n") });
  }

  return (
    <SendScaffold
      footer={
        <DepthButton
          label="Done"
          onPress={handleDone}
          tone={settled ? "green" : "cyan"}
          variant={settled ? "success" : "primary"}
        />
      }
      preset="success"
      showBack={false}
      subtitle={subtitle}
      title={title}
    >
      <View style={styles.content}>
        <GlassSurface style={styles.heroCard} variant="strong">
          <View style={[styles.iconWrap, settled ? styles.iconWrapSettled : styles.iconWrapQueued]}>
            <Icon
              color={settled ? theme.colors.green : theme.colors.cyan}
              name="check-circle"
              size={64}
            />
          </View>

          <Text style={styles.heroAmount}>
            {amount} {symbol}
          </Text>

          <View style={styles.pillRow}>
            <Pill label={statusLabel} tone={settled ? "green" : "cyan"} />
            <Pill label="On-chain" tone="neutral" />
          </View>
        </GlassSurface>

        <GlassSurface style={styles.receiptCard} variant="soft">
          <ReceiptRow label="Reference" value={shortReference(displayReference)} />
          <ReceiptRow label="Path" value="Current wallet send" />
          <ReceiptRow label="Share" valueComponent={
            <TouchableOpacity activeOpacity={0.8} onPress={handleShareReceipt} style={styles.inlineAction}>
              <Icon color={theme.colors.textSecondary} name="share-2" size={14} />
              <Text style={styles.inlineActionLabel}>Receipt</Text>
            </TouchableOpacity>
          } />

          <TouchableOpacity
            accessibilityLabel="Copy transfer reference"
            accessibilityRole="button"
            activeOpacity={0.8}
            onPress={handleCopyReference}
            style={styles.referenceButton}
          >
            <Text style={styles.referenceText}>{displayReference}</Text>
            <Icon color={theme.colors.cyan} name="copy" size={15} />
          </TouchableOpacity>

          {transaction?.signature && !settled ? (
            <Text style={styles.receiptHint}>
              Explorer may show the signature before settlement finalizes.
            </Text>
          ) : null}
        </GlassSurface>

        <View style={styles.secondaryActions}>
          <TouchableOpacity activeOpacity={0.8} onPress={handleViewExplorer} style={styles.secondaryAction}>
            <Icon color={theme.colors.textPrimary} name="external-link" size={16} />
            <Text style={styles.secondaryActionLabel}>View on Explorer</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} onPress={handleShareReceipt} style={styles.secondaryAction}>
            <Icon color={theme.colors.textPrimary} name="share-2" size={16} />
            <Text style={styles.secondaryActionLabel}>Share receipt</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SendScaffold>
  );
}

function ReceiptRow({
  label,
  value,
  valueComponent,
}: {
  label: string;
  value?: string;
  valueComponent?: React.ReactNode;
}) {
  return (
    <View style={styles.receiptRow}>
      <Text style={styles.receiptLabel}>{label}</Text>
      {valueComponent ?? <Text style={styles.receiptValue}>{value}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: theme.spacing.lg,
    justifyContent: "center",
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  heroCard: {
    alignItems: "center",
    borderRadius: theme.radius.xl,
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xxxl,
  },
  iconWrap: {
    alignItems: "center",
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 112,
    justifyContent: "center",
    width: 112,
  },
  iconWrapSettled: {
    backgroundColor: theme.colors.greenSoft,
    borderColor: theme.colors.greenGlowStrong,
  },
  iconWrapQueued: {
    backgroundColor: theme.colors.cyanSoft,
    borderColor: theme.colors.cyanGlowStrong,
  },
  heroAmount: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.display,
    fontSize: theme.type.hero,
    letterSpacing: -1.2,
    textAlign: "center",
  },
  pillRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "center",
  },
  receiptCard: {
    borderRadius: theme.radius.xl,
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  receiptRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  receiptLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  receiptValue: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  inlineAction: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  inlineActionLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
  },
  referenceButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  referenceText: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: theme.type.caption,
  },
  receiptHint: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.55,
  },
  secondaryActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  secondaryAction: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flex: 1,
    gap: theme.spacing.sm,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: theme.spacing.md,
  },
  secondaryActionLabel: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
  },
});
