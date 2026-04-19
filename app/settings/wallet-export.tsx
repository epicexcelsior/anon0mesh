import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as LocalAuthentication from "expo-local-authentication";

import { Backdrop } from "@/components/primitives/Backdrop";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { DepthButton } from "@/components/primitives/DepthButton";
import { Icon } from "@/components/primitives/Icon";
import { appTheme as theme } from "@/src/design-system/theme";

const SEED_PLACEHOLDER = "••• ••• ••• ••• ••• ••• ••• ••• ••• ••• ••• •••";

type RevealState = "hidden" | "revealed" | "error";

export default function WalletExportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [revealState, setRevealState] = useState<RevealState>("hidden");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleAuthenticate() {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to export wallet",
        fallbackLabel: "Use passcode",
      });
      if (result.success) {
        setRevealState("revealed");
        setErrorMessage("");
      } else {
        setRevealState("error");
        setErrorMessage("Authentication failed");
      }
    } catch {
      setRevealState("error");
      setErrorMessage("Authentication not available on this device");
    }
  }

  return (
    <View style={styles.root}>
      <Backdrop preset="settings" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
        <TouchableOpacity accessibilityLabel="Back" accessibilityRole="button" onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Icon name="arrow-left" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet Export</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Warning card */}
        <View style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <Text style={styles.warningTitle}>Never share your seed phrase</Text>
          </View>
          <Text style={styles.warningBody}>
            Anyone with this phrase can access your funds. Store it offline in a safe place.
          </Text>
        </View>

        {/* Seed phrase area */}
        <GlassSurface variant="regular" style={styles.seedCard}>
          {revealState === "revealed" ? (
            <Text style={styles.seedText}>{SEED_PLACEHOLDER}</Text>
          ) : (
            <View style={styles.lockedState}>
              <Icon name="lock" size={32} color={theme.colors.textMuted} />
              <Text style={styles.lockedText}>Seed phrase hidden</Text>
            </View>
          )}
        </GlassSurface>

        {/* Error message */}
        {revealState === "error" ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        {/* Auth button */}
        {revealState !== "revealed" ? (
          <DepthButton
            label="Authenticate to reveal"
            tone="amber"
            onPress={handleAuthenticate}
            icon={<Icon name="lock" size={16} color={theme.colors.textOnAccent} />}
          />
        ) : null}

        {/* Note */}
        <GlassSurface variant="regular" style={styles.noteCard}>
          <Text style={styles.noteText}>
            Export only available for local wallets. MWA wallets are managed by your external wallet.
          </Text>
        </GlassSurface>
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
  warningCard: {
    backgroundColor: theme.colors.errorContainer,
    borderColor: theme.colors.errorOutline,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  warningHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  warningTitle: {
    color: theme.colors.red,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.body,
  },
  warningBody: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
    lineHeight: theme.type.body * 1.5,
  },
  seedCard: {
    alignItems: "center",
    borderRadius: theme.radius.md,
    minHeight: 100,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xxl,
  },
  seedText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.mono,
    fontSize: theme.type.bodyLg,
    letterSpacing: 2,
    lineHeight: theme.type.bodyLg * 1.8,
    textAlign: "center",
  },
  lockedState: {
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  lockedText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
  },
  errorText: {
    color: theme.colors.red,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
    textAlign: "center",
  },
  noteCard: {
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  noteText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.6,
  },
});
