import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { DepthButton, AppTextInput } from "@/components/primitives";
import { Backdrop } from "@/components/primitives/Backdrop";
import { PermissionPrimer } from "@/components/onboarding/PermissionPrimer";
import { WalletPathPicker } from "@/components/onboarding/WalletPathPicker";
import { appTheme as theme } from "@/src/design-system/theme";

const PERMISSIONS = [
  {
    iconName: "bluetooth",
    title: "Bluetooth",
    reason: "Needed to discover and relay transactions across nearby devices.",
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
  const [displayName, setDisplayName] = useState("");
  const [alias] = useState(generateAlias);

  function handleEnter() {
    router.replace("/(tabs)/home");
  }

  return (
    <View style={styles.root}>
      <Backdrop preset="home" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>Set up your identity</Text>

        <View style={styles.section}>
          <AppTextInput
            label="Display Name (optional)"
            placeholder="Leave blank to stay anonymous"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.aliasPreview}>
            Mesh alias: <Text style={styles.aliasValue}>{alias}</Text>
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PERMISSIONS</Text>
          {PERMISSIONS.map((p) => (
            <PermissionPrimer key={p.iconName} {...p} />
          ))}
        </View>

        <WalletPathPicker onCreateNew={handleEnter} onConnect={handleEnter} />

        <DepthButton
          label="ENTER THE MESH"
          variant="primary"
          tone="cyan"
          size="lg"
          onPress={handleEnter}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: { flex: 1 },
  content: {
    padding: theme.spacing.xxl,
    paddingTop: 64,
    gap: theme.spacing.xxl,
    paddingBottom: 48,
  },
  headline: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.display,
    lineHeight: 36,
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
});
