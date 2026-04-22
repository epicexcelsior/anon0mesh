import Constants from "expo-constants";
import React, { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

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
            <Animated.Text
              entering={FadeIn.duration(700).delay(500)}
              style={styles.tagline}
            >
              Private by default.
            </Animated.Text>
          </View>

          <Animated.View entering={FadeInUp.duration(600).delay(850)} style={styles.ctaBlock}>
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
          </Animated.View>
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
    fontSize: theme.type.bodyLg,
    letterSpacing: 0.3,
  },
  ctaBlock: {
    alignItems: "center",
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
