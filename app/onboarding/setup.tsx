import React, { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppTextInput } from "@/components/primitives";
import { Backdrop } from "@/components/primitives/Backdrop";
import { IconButton } from "@/components/primitives/IconButton";
import { PermissionPrimer } from "@/components/onboarding/PermissionPrimer";
import { WalletPathPicker } from "@/components/onboarding/WalletPathPicker";
import { appTheme as theme } from "@/src/design-system/theme";
import { saveLocalDisplayNameForAddress } from "@/src/hooks/useLocalDisplayName";
import { useAdapters } from "@/src/providers/AdapterProvider";

const PERMISSIONS = [
  {
    iconName: "bluetooth",
    title: "Bluetooth",
    reason: "Needed to discover nearby peers and future mesh delivery flows.",
  },
  {
    iconName: "bell",
    title: "Notifications",
    reason: "Get notified when a queued transfer settles on-chain.",
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
  const { intent } = useLocalSearchParams<{ intent?: string }>();
  const adapters = useAdapters();
  const [displayName, setDisplayName] = useState("");
  const [alias] = useState(generateAlias);
  const [error, setError] = useState<string | null>(null);
  const [submittingPath, setSubmittingPath] = useState<"create" | "connect" | null>(null);
  const returning = intent === "existing";

  const canCreate = adapters.wallet.canCreateLocalWallet();
  const canConnect = adapters.wallet.canConnectExternalWallet();

  async function finalizeSetup(address: string) {
    await saveLocalDisplayNameForAddress(address, displayName);
    router.replace("/(tabs)/home");
  }

  async function handleCreate() {
    if (!canCreate || submittingPath) return;

    setError(null);
    setSubmittingPath("create");

    try {
      const wallet = await adapters.wallet.createLocalWallet();
      await finalizeSetup(wallet.address);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Wallet setup failed");
    } finally {
      setSubmittingPath(null);
    }
  }

  async function handleConnect() {
    if (!canConnect || submittingPath) return;

    setError(null);
    setSubmittingPath("connect");

    try {
      const wallet = await adapters.wallet.connectExternalWallet();
      await finalizeSetup(wallet.address);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Wallet connect failed");
    } finally {
      setSubmittingPath(null);
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
            paddingTop: insets.top + theme.spacing.huge,
            paddingBottom: insets.bottom + theme.spacing.xxxl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>
          {returning ? "Welcome back" : "Set up your identity"}
        </Text>
        <Text style={styles.subheadline}>
          {returning
            ? "Reconnect your wallet on this device."
            : "Your keys stay on this device. Pick how to get started."}
        </Text>

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
          <Text style={styles.sectionLabel}>PERMISSIONS</Text>
          {PERMISSIONS.map((p) => (
            <PermissionPrimer key={p.iconName} {...p} />
          ))}
        </View>

        <WalletPathPicker
          canConnect={canConnect}
          canCreate={canCreate}
          connectHint={
            canConnect ? null : "This device is currently using the local wallet lane."
          }
          createHint={
            canCreate ? null : "This device is currently using the external wallet lane."
          }
          intent={returning ? "existing" : "new"}
          loading={submittingPath !== null}
          onCreateNew={handleCreate}
          onConnect={handleConnect}
        />

        {submittingPath ? (
          <View style={styles.statusRow}>
            <ActivityIndicator color={theme.colors.cyan} size="small" />
            <Text style={styles.statusText}>
              {submittingPath === "create"
                ? "Preparing local wallet…"
                : "Connecting external wallet…"}
            </Text>
          </View>
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
  sectionLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
    letterSpacing: 0.8,
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
