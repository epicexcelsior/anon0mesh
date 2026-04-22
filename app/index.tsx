import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

import { DepthButton } from "@/components/primitives";
import { LandingCanvas } from "@/components/onboarding/LandingCanvas";
import { appTheme as theme } from "@/src/design-system/theme";
import { useWallet } from "@/src/hooks/useWallet";

// Minimum amount of time the logo holds on-screen before we redirect a
// returning user to Home. Keeps the "hello" moment visible even when
// the wallet resolves quickly.
const MIN_SPLASH_MS = 1100;

export default function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const version = Constants.expoConfig?.version ?? "dev";
  const { wallet, loading: walletLoading } = useWallet();
  const [minSplashElapsed, setMinSplashElapsed] = useState(false);

  // Hold the logo at least MIN_SPLASH_MS so the "open app" moment is
  // visible even for returning users whose wallet resolves instantly.
  useEffect(() => {
    const timer = setTimeout(() => setMinSplashElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  // Returning user with a wallet — redirect once both the wallet has
  // resolved AND the minimum splash moment has elapsed.
  useEffect(() => {
    if (!walletLoading && wallet && minSplashElapsed) {
      router.replace("/(tabs)/home" as Parameters<typeof router.replace>[0]);
    }
  }, [walletLoading, wallet, minSplashElapsed, router]);

  // Full landing content (tagline + CTA) only when we know the user
  // needs to onboard. Logo always renders for the "hello" moment.
  const showFullLanding = !walletLoading && !wallet;

  return (
    <View style={styles.root}>
      <LandingCanvas />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + theme.spacing.xxxl,
            paddingBottom: insets.bottom + theme.spacing.xxl,
          },
        ]}
      >
        <View style={styles.logoBlock}>
          <Animated.Image
            entering={FadeIn.duration(900)}
            source={require("@/assets/brand/anonmesh-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          {showFullLanding ? (
            <Animated.Text
              entering={FadeIn.duration(700).delay(500)}
              style={styles.tagline}
            >
              Private by default.
            </Animated.Text>
          ) : null}
        </View>

        {showFullLanding ? (
          <Animated.View entering={FadeInUp.duration(600).delay(850)} style={styles.ctaBlock}>
            <DepthButton
              label="ENTER THE MESH"
              variant="primary"
              tone="cyan"
              size="lg"
              onPress={() => router.push("/onboarding/welcome")}
            />

            {__DEV__ && process.env.EXPO_PUBLIC_ADAPTERS === "fixtures" && (
              <View style={styles.devSkipBlock}>
                <Text
                  style={styles.devSkip}
                  onPress={() => router.replace("/(tabs)/home" as Parameters<typeof router.replace>[0])}
                >
                  dev: skip to app →
                </Text>
              </View>
            )}

            <View style={styles.versionBlock}>
              <Text style={styles.version}>v{version}</Text>
            </View>
          </Animated.View>
        ) : null}
      </View>
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
    alignItems: "stretch",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.xxl,
  },
  logoBlock: {
    alignItems: "center",
    gap: theme.spacing.lg,
    flex: 1,
    justifyContent: "center",
  },
  logo: {
    width: 180,
    height: 180,
  },
  tagline: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: 17,
    letterSpacing: 0.3,
  },
  devSkipBlock: {
    alignItems: "center",
  },
  versionBlock: {
    alignItems: "center",
  },
  ctaBlock: {
    alignItems: "stretch",
    gap: theme.spacing.sm,
  },
  version: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.mono,
    fontSize: theme.type.caption,
    letterSpacing: 0.5,
    marginTop: theme.spacing.sm,
  },
  devSkip: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.mono,
    fontSize: theme.type.caption,
    letterSpacing: 0.3,
    paddingVertical: 8,
  },
});
