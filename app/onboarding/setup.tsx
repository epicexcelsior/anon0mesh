import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppTextInput } from "@/components/primitives";
import { Backdrop } from "@/components/primitives/Backdrop";
import { DepthButton } from "@/components/primitives/DepthButton";
import { IconButton } from "@/components/primitives/IconButton";
import { PermissionPrimer } from "@/components/onboarding/PermissionPrimer";
import { appTheme as theme } from "@/src/design-system/theme";
import { saveLocalDisplayNameForAddress } from "@/src/hooks/useLocalDisplayName";
import { useAdapters } from "@/src/providers/AdapterProvider";
import type { BLEPermissionStatus } from "@/src/utils/blePermissions";
import { checkBLEPermissions, requestBLEPermissions } from "@/src/utils/blePermissions";

const PERMISSIONS = [
  {
    iconName: "bluetooth",
    title: "Bluetooth",
    reason: "Discover nearby peers over BLE mesh.",
  },
  {
    iconName: "map-pin",
    title: "Location (nearby devices)",
    reason: "Required by Android to receive Bluetooth scan results.",
  },
  {
    iconName: "bell",
    title: "Notifications",
    reason: "Ping you when a queued transfer or message settles.",
  },
] as const;

function generateAlias() {
  const adj = ["silent", "phantom", "spectral", "cipher", "shadow", "veiled"];
  const noun = ["fox", "owl", "raven", "wolf", "manta", "lynx"];
  return `${adj[Math.floor(Math.random() * adj.length)]}-${noun[Math.floor(Math.random() * noun.length)]}`;
}

export default function SetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const adapters = useAdapters();
  const [displayName, setDisplayName] = useState("");
  const [alias] = useState(generateAlias);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<BLEPermissionStatus | "pending" | "unknown">("unknown");

  const mode = adapters.wallet.getMode();
  const canCreate = adapters.wallet.canCreateLocalWallet();
  const canConnect = adapters.wallet.canConnectExternalWallet();
  const canSetup = canCreate || canConnect;

  const buttonLabel = submitting
    ? (canCreate ? "Creating wallet…" : "Opening Seed Vault…")
    : (canCreate ? "Create my wallet" : "Connect with Seed Vault");
  const statusLabel = canCreate
    ? "Generating keys on this device…"
    : "Handing off to Seed Vault…";
  const subheadCopy = canCreate
    ? "Your keys stay on this device. One tap to generate a fresh wallet."
    : "Your Seeker's Seed Vault holds your keys. Tap to create or connect an existing wallet.";

  useEffect(() => {
    let active = true;
    void checkBLEPermissions().then((status) => {
      if (active) setPermissionStatus(status);
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleRequestPermissions() {
    setPermissionStatus("pending");
    const status = await requestBLEPermissions();
    setPermissionStatus(status);
  }

  async function finalizeSetup(address: string) {
    await saveLocalDisplayNameForAddress(address, displayName);
    router.replace("/(tabs)/home" as Parameters<typeof router.replace>[0]);
  }

  async function handleCreate() {
    if (!canSetup || submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      const wallet = canCreate
        ? await adapters.wallet.createLocalWallet()
        : await adapters.wallet.connectExternalWallet();
      await finalizeSetup(wallet.address);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Wallet setup failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.root}>
      <Backdrop preset="home" />

      <View style={[styles.backRow, { top: insets.top + theme.spacing.sm }]}>
        <IconButton
          accessibilityLabel="Back"
          name="arrow-left"
          onPress={() => router.back()}
          size="md"
          tone="neutral"
          variant="contained"
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            // Back button (44px) + safe-area top + vertical breathing room
            // so the headline never clips into the pressable.
            paddingTop: insets.top + theme.spacing.sm + 44 + theme.spacing.lg,
            paddingBottom: insets.bottom + theme.spacing.xxxl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>Set up your identity</Text>
        <Text style={styles.subheadline}>{subheadCopy}</Text>

        <View style={styles.section}>
          <AppTextInput
            label="Display Name (optional)"
            placeholder="Leave blank to stay anonymous"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            autoCorrect={false}
          />
          <Text style={styles.aliasPreview}>
            Leave blank to use: <Text style={styles.aliasValue}>{alias}</Text>
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionLabelRow}>
            <Text style={styles.sectionLabel}>PERMISSIONS</Text>
            {permissionStatus === "granted" || permissionStatus === "not_required" ? (
              <Text style={styles.permissionStatus}>✓ Granted</Text>
            ) : null}
          </View>
          {PERMISSIONS.map((p) => (
            <PermissionPrimer key={p.iconName} {...p} />
          ))}
          {permissionStatus !== "granted" && permissionStatus !== "not_required" ? (
            <DepthButton
              label={
                permissionStatus === "pending"
                  ? "Requesting…"
                  : permissionStatus === "never_ask_again"
                    ? "Open settings"
                    : "Grant permissions"
              }
              variant="secondary"
              tone="cyan"
              size="md"
              disabled={permissionStatus === "pending"}
              onPress={handleRequestPermissions}
            />
          ) : null}
        </View>

        <DepthButton
          label={buttonLabel}
          variant="primary"
          tone="cyan"
          size="lg"
          disabled={!canSetup || submitting}
          onPress={handleCreate}
        />

        {submitting ? (
          <View style={styles.statusRow}>
            <ActivityIndicator color={theme.colors.cyan} size="small" />
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        ) : null}

        {!canSetup ? (
          <Text style={styles.statusText}>
            No wallet path is available on this device yet.
          </Text>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backRow: {
    left: theme.spacing.lg,
    position: "absolute",
    zIndex: 10,
  },
  scroll: { flex: 1 },
  content: {
    padding: theme.spacing.xxl,
    gap: theme.spacing.xxl,
  },
  headline: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.display,
    lineHeight: theme.type.display + theme.spacing.sm,
  },
  subheadline: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.bodyLg,
    lineHeight: 24,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
    letterSpacing: 0.8,
  },
  permissionStatus: {
    color: theme.colors.green,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
  },
  aliasPreview: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
  aliasValue: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.mono,
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  statusText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
  errorText: {
    color: theme.colors.red,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.45,
  },
});
