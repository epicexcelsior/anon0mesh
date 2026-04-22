import React from "react";
import { Alert, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";

import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { appTheme as theme } from "@/src/design-system/theme";

interface ReceiveCardProps {
  address: string;
}

function shortAddress(addr: string): string {
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-4)}`;
}

export function ReceiveCard({ address }: ReceiveCardProps) {
  async function handleCopy() {
    try {
      await Clipboard.setStringAsync(address);
      Alert.alert("Copied!", `${address.slice(0, 12)}...`);
    } catch {
      Alert.alert("Copied!", `${address.slice(0, 12)}...`);
    }
  }

  async function handleShare() {
    try {
      await Share.share({
        message: `AnonMesh receive address\n${address}`,
      });
    } catch {
      Alert.alert("Share unavailable", "Could not open the system share sheet.");
    }
  }

  return (
    <GlassSurface variant="strong" style={styles.card}>
      {/* QR code */}
      <View style={styles.qrWrap}>
        <QRCode
          value={address || "anon"}
          size={200}
          color={theme.colors.textPrimary}
          backgroundColor={theme.colors.surface}
        />
      </View>

      {/* Address */}
      <Text style={styles.addressLabel}>Your address</Text>
      <Text style={styles.address} selectable numberOfLines={1}>
        {shortAddress(address)}
      </Text>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleCopy}
          style={styles.actionBtn}
        >
          <Icon name="copy" size={16} color={theme.colors.cyan} />
          <Text style={styles.actionLabel}>Copy</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleShare}
          style={styles.actionBtn}
        >
          <Icon name="share-2" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.actionLabel, styles.actionLabelMuted]}>Share</Text>
        </TouchableOpacity>
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    borderRadius: theme.radius.xl,
    gap: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.xxxl,
  },
  qrWrap: {
    borderRadius: theme.radius.md,
    overflow: "hidden",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  addressLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
    letterSpacing: 0.4,
    marginTop: theme.spacing.sm,
    textTransform: "uppercase",
  },
  address: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.mono,
    fontSize: theme.type.body,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  actionBtn: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "center",
    paddingVertical: theme.spacing.sm,
  },
  actionLabel: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  actionLabelMuted: {
    color: theme.colors.textSecondary,
  },
  divider: {
    backgroundColor: theme.colors.line,
    height: 24,
    width: StyleSheet.hairlineWidth,
  },
});
