import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";

import { Backdrop } from "@/components/primitives/Backdrop";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { DepthButton } from "@/components/primitives/DepthButton";
import { AppTextInput } from "@/components/primitives/AppTextInput";
import { Icon } from "@/components/primitives/Icon";
import { useWallet } from "@/src/hooks/useWallet";
import { appTheme as theme } from "@/src/design-system/theme";

export default function IdentityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { wallet } = useWallet();

  const address = wallet?.address ?? "";
  const alias = typeof wallet?.identity === "string" ? wallet.identity : "";

  const [displayName, setDisplayName] = useState(alias);
  const [copied, setCopied] = useState(false);

  const isChanged = displayName !== alias && displayName.trim().length > 0;

  async function handleCopy() {
    try {
      await Clipboard.setStringAsync(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert("Copy", address);
    }
  }

  function handleSave() {
    // Stub: real persistence in Phase 5
    Alert.alert("Saved", "Display name updated (persists in Phase 5)");
  }

  return (
    <View style={styles.root}>
      <Backdrop preset="settings" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
        <TouchableOpacity accessibilityLabel="Back" accessibilityRole="button" onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Icon name="arrow-left" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identity</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
      >
        <GlassSurface variant="regular" style={styles.card}>
          {/* QR Code */}
          <View style={styles.qrWrap}>
            {address ? (
              <QRCode
                value={address}
                size={160}
                backgroundColor="transparent"
                color={theme.colors.textPrimary}
              />
            ) : (
              <View style={styles.qrPlaceholder} />
            )}
          </View>

          {/* Alias */}
          {alias ? (
            <Text style={styles.aliasText}>{alias}</Text>
          ) : null}

          {/* Full address */}
          {address ? (
            <Text style={styles.addressText} selectable>
              {address}
            </Text>
          ) : null}

          {/* Copy button */}
          <TouchableOpacity
            accessibilityLabel="Copy address"
            accessibilityRole="button"
            onPress={handleCopy}
            style={styles.copyRow}
            activeOpacity={0.7}
          >
            <Icon
              name={copied ? "check" : "copy"}
              size={16}
              color={copied ? theme.colors.green : theme.colors.cyan}
            />
            <Text style={[styles.copyText, copied && styles.copyTextDone]}>
              {copied ? "Copied!" : "Copy address"}
            </Text>
          </TouchableOpacity>
        </GlassSurface>

        {/* Display name input */}
        <AppTextInput
          label="Display name"
          placeholder={alias || "Enter a display name"}
          value={displayName}
          onChangeText={setDisplayName}
          autoCorrect={false}
          containerStyle={styles.input}
        />

        {/* Save button */}
        <DepthButton
          label="Save"
          disabled={!isChanged}
          onPress={handleSave}
          style={styles.saveBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  backBtn: {
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.section,
    textAlign: "center",
  },
  headerSpacer: {
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  card: {
    alignItems: "center",
    borderRadius: theme.radius.md,
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xxl,
  },
  qrWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  qrPlaceholder: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.sm,
    height: 160,
    width: 160,
  },
  aliasText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.section,
    textAlign: "center",
  },
  addressText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.mono,
    fontSize: theme.type.caption,
    textAlign: "center",
  },
  copyRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
  },
  copyText: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
  },
  copyTextDone: {
    color: theme.colors.green,
  },
  input: {
    marginTop: theme.spacing.xs,
  },
  saveBtn: {
    marginTop: theme.spacing.xs,
  },
});
