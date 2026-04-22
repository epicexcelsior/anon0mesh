import React, { useState } from "react";
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
  const adapters = useAdapters();
  const [displayName, setDisplayName] = useState("");
  const [alias] = useState(generateAlias);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canCreate = adapters.wallet.canCreateLocalWallet();

  async function finalizeSetup(address: string) {
    await saveLocalDisplayNameForAddress(address, displayName);
    router.replace("/(tabs)/home" as Parameters<typeof router.replace>[0]);
  }

  async function handleCreate() {
    if (!canCreate || submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      const wallet = await adapters.wallet.createLocalWallet();
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
            paddingTop: insets.top + theme.spacing.huge,
            paddingBottom: insets.bottom + theme.spacing.xxxl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>Set up your identity</Text>
        <Text style={styles.subheadline}>
          Your keys stay on this device. One tap to generate a fresh wallet.
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

        <DepthButton
          label={submitting ? "Creating wallet…" : "Create my wallet"}
          variant="primary"
          tone="cyan"
          size="lg"
          disabled={!canCreate || submitting}
          onPress={handleCreate}
        />

        {submitting ? (
          <View style={styles.statusRow}>
            <ActivityIndicator color={theme.colors.cyan} size="small" />
            <Text style={styles.statusText}>Generating keys on this device…</Text>
          </View>
        ) : null}

        {!canCreate ? (
          <Text style={styles.statusText}>
            Local wallet creation is unavailable in the current wallet lane.
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
