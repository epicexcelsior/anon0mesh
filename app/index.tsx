import Constants from "expo-constants";
import React, { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DepthButton } from "@/components/primitives";
import { LandingCanvas } from "@/components/onboarding/LandingCanvas";
import { appTheme as theme } from "@/src/design-system/theme";
import { useWallet } from "@/src/hooks/useWallet";

export default function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const version = Constants.expoConfig?.version ?? "dev";
  const { wallet, loading: walletLoading } = useWallet();

  // Existing users skip onboarding entirely — route straight to Home.
  useEffect(() => {
    if (!walletLoading && wallet) {
      router.replace("/(tabs)/home" as Parameters<typeof router.replace>[0]);
    }
  }, [walletLoading, wallet, router]);

  // While we're resolving wallet state, hold content (atmosphere still renders).
  const showContent = !walletLoading && !wallet;

  return (
    <View style={styles.root}>
      <LandingCanvas />
      {showContent ? (
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + theme.spacing.xxxl,
            paddingBottom: insets.bottom + theme.spacing.xxxl,
          },
        ]}
      >
        <View style={styles.logoBlock}>
          <Image
            source={require("@/assets/brand/anonmesh-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.wordmark}>ANONMESH</Text>
          <Text style={styles.tagline}>Private by default.</Text>
        </View>

        <DepthButton
          label="ENTER THE MESH"
          variant="primary"
          tone="cyan"
          size="lg"
          onPress={() => router.push("/onboarding/welcome")}
        />

        {__DEV__ && process.env.EXPO_PUBLIC_ADAPTERS === "fixtures" && (
          <Text
            style={styles.devSkip}
            onPress={() => router.replace("/(tabs)/home" as Parameters<typeof router.replace>[0])}
          >
            dev: skip to app →
          </Text>
        )}

        <Text style={styles.version}>v{version}</Text>
      </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.xxl,
  },
  logoBlock: {
    alignItems: "center",
    gap: theme.spacing.md,
    marginTop: theme.spacing.huge,
  },
  logo: {
    width: 80,
    height: 80,
  },
  wordmark: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.title,
    letterSpacing: 6,
  },
  tagline: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
    letterSpacing: 0.3,
  },
  version: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.mono,
    fontSize: theme.type.caption,
    letterSpacing: 0.5,
  },
  devSkip: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.mono,
    fontSize: theme.type.caption,
    letterSpacing: 0.3,
    paddingVertical: 8,
  },
});
