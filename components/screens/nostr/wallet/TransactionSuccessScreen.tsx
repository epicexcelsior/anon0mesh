import VoidCard from "@/components/ui/VoidCard";
import VoidScreen from "@/components/ui/VoidScreen";
import { VP } from "@/constants/void-protocol";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowSquareOut,
  CaretLeft,
  CheckCircle,
  Export,
} from "phosphor-react-native";
import React from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TransactionSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    amount?: string;
    currency?: string;
    recipient?: string;
    recipientName?: string;
    signature?: string;
    fee?: string;
    route?: string;
    privacy?: string;
  }>();

  const amount = params.amount || "0";
  const currency = params.currency || "SOL";
  const recipient = params.recipient || "";
  const recipientName = params.recipientName || "";
  const signature = params.signature || "";
  const fee = params.fee || "0.000005";
  const route = params.route || "Direct Mesh";
  const privacy = params.privacy || "Shielded";

  const formatAddress = (addr: string) => {
    if (!addr || addr.length < 8) return addr;
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const handleViewExplorer = () => {
    if (signature) {
      Alert.alert(
        "Explorer",
        `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      );
    }
  };

  const handleShareReceipt = () => {
    Alert.alert(
      "Share Receipt",
      `Sent ${amount} ${currency} to ${formatAddress(recipient)}\nSignature: ${formatAddress(signature)}`,
    );
  };

  const handleDone = () => {
    router.back();
  };

  const now = new Date();
  const timestamp = `TODAY, ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} UTC`;

  return (
    <VoidScreen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDone} style={styles.backButton}>
          <CaretLeft
            size={24}
            color={VP.colors.accent.cyan}
            weight="regular"
          />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>TRANSACTION</Text>
          <Text style={styles.headerVersion}>ANONMESH CORE V2.4</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      {/* Success Icon */}
      <View style={styles.successSection}>
        <View style={styles.checkCircle}>
          <CheckCircle
            size={48}
            color={VP.colors.accent.cyan}
            weight="fill"
          />
        </View>
        <Text style={styles.successLabel}>SENT SUCCESSFULLY</Text>
        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>

      {/* Amount */}
      <View style={styles.amountSection}>
        <Text style={styles.amountText}>
          {amount} {currency}
        </Text>
      </View>

      {/* Details Card */}
      <VoidCard elevated style={styles.detailsCard}>
        <DetailRow label="TO" value={recipientName || formatAddress(recipient)} />
        <DetailRow label="ADDRESS" value={formatAddress(recipient)} mono />
        <DetailRow label="NETWORK FEE" value={`${fee} SOL`} mono />
        <DetailRow label="ROUTE" value={route} badge="mesh" />
        <DetailRow label="PRIVACY" value={privacy} badge="shielded" />
        {signature ? (
          <DetailRow
            label="SIGNATURE"
            value={formatAddress(signature)}
            mono
            last
          />
        ) : null}
      </VoidCard>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <Pressable style={styles.secondaryButton} onPress={handleViewExplorer}>
          <ArrowSquareOut
            size={16}
            color={VP.colors.accent.cyan}
            weight="regular"
          />
          <Text style={styles.secondaryButtonText}>View on Explorer</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={handleShareReceipt}>
          <Export
            size={16}
            color={VP.colors.accent.cyan}
            weight="regular"
          />
          <Text style={styles.secondaryButtonText}>Share Receipt</Text>
        </Pressable>
      </View>

      {/* Done Button */}
      <Pressable style={styles.doneButton} onPress={handleDone}>
        <Text style={styles.doneButtonText}>DONE</Text>
      </Pressable>
    </VoidScreen>
  );
}

function DetailRow({
  label,
  value,
  mono,
  badge,
  last,
}: {
  label: string;
  value: string;
  mono?: boolean;
  badge?: "mesh" | "shielded";
  last?: boolean;
}) {
  return (
    <View style={[detailStyles.row, !last && detailStyles.rowBorder]}>
      <Text style={detailStyles.label}>{label}</Text>
      <View style={detailStyles.valueContainer}>
        {badge === "mesh" && (
          <Text style={detailStyles.meshBadge}>Mesh</Text>
        )}
        {badge === "shielded" && (
          <Text style={detailStyles.shieldedBadge}>Shielded</Text>
        )}
        <Text style={[detailStyles.value, mono && detailStyles.valueMono]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: VP.colors.ghostBorder,
  },
  label: {
    ...VP.typography.label,
    color: VP.colors.text.disabled,
    letterSpacing: 1,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: VP.spacing.sm,
  },
  value: {
    ...VP.typography.body,
    color: VP.colors.text.primary,
  },
  valueMono: {
    ...VP.typography.monoSmall,
    color: VP.colors.accent.cyan,
  },
  meshBadge: {
    ...VP.typography.caption,
    color: VP.colors.accent.cyan,
    backgroundColor: VP.colors.accent.cyanGhost,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
    fontFamily: "JetBrainsMono-Medium",
  },
  shieldedBadge: {
    ...VP.typography.caption,
    color: VP.colors.accent.purple,
    backgroundColor: VP.colors.accent.purpleMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
    fontFamily: "JetBrainsMono-Medium",
  },
});

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: VP.spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: VP.colors.ghostBorder,
  },
  backButton: {
    padding: VP.spacing.xs,
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    ...VP.typography.label,
    color: VP.colors.text.primary,
    letterSpacing: 2,
    fontSize: 16,
  },
  headerVersion: {
    ...VP.typography.caption,
    color: VP.colors.text.disabled,
    letterSpacing: 1,
    marginTop: 2,
  },
  successSection: {
    alignItems: "center",
    marginTop: VP.spacing.xl,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: VP.colors.accent.cyanGhost,
    borderWidth: 2,
    borderColor: VP.colors.accent.cyanMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: VP.spacing.md,
  },
  successLabel: {
    ...VP.typography.label,
    color: VP.colors.text.primary,
    letterSpacing: 2,
  },
  timestamp: {
    ...VP.typography.monoSmall,
    color: VP.colors.text.disabled,
    marginTop: VP.spacing.xs,
  },
  amountSection: {
    alignItems: "center",
    marginTop: VP.spacing.lg,
    marginBottom: VP.spacing.lg,
  },
  amountText: {
    fontSize: 32,
    fontFamily: "JetBrainsMono-Medium",
    color: VP.colors.text.primary,
  },
  detailsCard: {
    marginHorizontal: VP.spacing.md,
    paddingVertical: VP.spacing.sm,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: VP.spacing.md,
    marginTop: VP.spacing.lg,
    paddingHorizontal: VP.spacing.md,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: VP.spacing.sm,
    paddingVertical: VP.spacing.md,
    borderRadius: VP.radius.md,
    borderWidth: 1,
    borderColor: VP.colors.ghostBorder,
    backgroundColor: VP.colors.surface,
  },
  secondaryButtonText: {
    ...VP.typography.label,
    color: VP.colors.accent.cyan,
    letterSpacing: 0.5,
  },
  doneButton: {
    marginHorizontal: VP.spacing.md,
    marginTop: VP.spacing.lg,
    marginBottom: VP.spacing.lg,
    backgroundColor: VP.colors.accent.cyan,
    borderRadius: VP.radius.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  doneButtonText: {
    ...VP.typography.subheader,
    color: VP.colors.text.inverse,
    fontFamily: "SpaceGrotesk-Bold",
    letterSpacing: 2,
  },
});
