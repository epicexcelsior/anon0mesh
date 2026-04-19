import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { DepthButton } from "@/components/primitives";
import { Backdrop } from "@/components/primitives/Backdrop";
import { FeatureHighlight } from "@/components/onboarding/FeatureHighlight";
import { appTheme as theme } from "@/src/design-system/theme";

const FEATURES = [
  {
    iconName: "mesh-nodes",
    title: "Mesh-routed payments",
    body: "Transactions hop peer-to-peer over BLE and LXMF. No internet required.",
  },
  {
    iconName: "lock-mesh",
    title: "Private by default",
    body: "Stealth addresses and onion-routed hops mean senders and receivers stay invisible.",
  },
  {
    iconName: "identity-chip",
    title: "Self-sovereign identity",
    body: "Your identity lives on-device. No accounts, no servers, no trackers.",
  },
  {
    iconName: "signal",
    title: "Offline-first",
    body: "Queued transactions propagate when a path to the Solana cluster appears.",
  },
] as const;

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <Backdrop preset="home" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>Private by default.</Text>
        <Text style={styles.subheadline}>
          AnonMesh is a censorship-resistant payment network built on BLE mesh + Solana.
        </Text>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <FeatureHighlight key={f.iconName} {...f} />
          ))}
        </View>

        <View style={styles.actions}>
          <DepthButton
            label="GET STARTED"
            variant="primary"
            tone="cyan"
            size="lg"
            onPress={() => router.push("/onboarding/setup")}
          />
          <DepthButton
            label="I have an identity"
            variant="secondary"
            tone="cyan"
            size="md"
            onPress={() => {}}
          />
          <Pressable onPress={() => router.push("/onboarding/tech-drawer")}>
            <Text style={styles.techLink}>Under the hood →</Text>
          </Pressable>
        </View>
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
    gap: theme.spacing.xxxl,
    paddingBottom: 48,
  },
  headline: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.display,
    lineHeight: 36,
  },
  subheadline: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
    lineHeight: 22,
    marginTop: -theme.spacing.lg,
  },
  features: {
    gap: theme.spacing.md,
  },
  actions: {
    gap: theme.spacing.md,
    alignItems: "center",
  },
  techLink: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    letterSpacing: 0.3,
  },
});
