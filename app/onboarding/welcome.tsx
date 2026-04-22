import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DepthButton } from "@/components/primitives";
import { Backdrop } from "@/components/primitives/Backdrop";
import { FeatureHighlight } from "@/components/onboarding/FeatureHighlight";
import * as haptics from "@/src/design-system/haptics";
import { appTheme as theme } from "@/src/design-system/theme";

const FEATURES = [
  {
    iconName: "mesh-nodes",
    title: "Mesh-aware payments",
    body: "Send when there's signal. Queue when there isn't.",
  },
  {
    iconName: "lock-mesh",
    title: "Identity on-device",
    body: "No accounts. No servers. No trackers.",
  },
  {
    iconName: "signal",
    title: "Works offline",
    body: "Transfers settle when a path reappears.",
  },
] as const;

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const existingIdentityTarget: Parameters<typeof router.push>[0] = {
    pathname: "/onboarding/setup",
    params: { intent: "existing" },
  };

  return (
    <View style={styles.root}>
      <Backdrop preset="home" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + theme.spacing.xxl,
            paddingBottom: insets.bottom + theme.spacing.xxxl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>Private by default.</Text>
        <Text style={styles.subheadline}>
          Payments and messages that work without the internet.
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
            onPress={() => router.push(existingIdentityTarget)}
          />
          <Pressable
            accessibilityLabel="Open technical overview"
            accessibilityRole="button"
            onPress={() => {
              haptics.select();
              router.push("/onboarding/tech-drawer");
            }}
          >
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
    gap: theme.spacing.xxxl,
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
