import BottomSheet from "@gorhom/bottom-sheet";
import React, { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { DepthButton } from "@/components/primitives";
import { Backdrop } from "@/components/primitives/Backdrop";
import { IconButton } from "@/components/primitives/IconButton";
import { Sheet } from "@/components/primitives/Sheet";
import { FeatureHighlight } from "@/components/onboarding/FeatureHighlight";
import { TechDrawerContent } from "@/components/onboarding/TechDrawerContent";
import * as haptics from "@/src/design-system/haptics";
import { appTheme as theme } from "@/src/design-system/theme";
import { useAdapters } from "@/src/providers/AdapterProvider";

const REVEAL_DURATION = 480;
const REVEAL_STAGGER = 110;
const REVEAL_START = 80;
function reveal(index: number) {
  return FadeInDown.duration(REVEAL_DURATION).delay(REVEAL_START + index * REVEAL_STAGGER);
}

const FEATURES = [
  {
    iconName: "radio" as const,
    title: "Mesh-aware payments",
    body: "Send when there's signal. Queue when there isn't.",
  },
  {
    iconName: "lock" as const,
    title: "Identity on-device",
    body: "No accounts. No servers. No trackers.",
  },
  {
    iconName: "wifi-off" as const,
    title: "Works offline",
    body: "Transfers settle when a path reappears.",
  },
] as const;

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const adapters = useAdapters();
  const techSheetRef = useRef<BottomSheet>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  function openTechSheet() {
    haptics.select();
    techSheetRef.current?.expand();
  }

  function closeTechSheet() {
    techSheetRef.current?.close();
  }

  async function handleConnectExisting() {
    if (connecting) return;
    setConnectError(null);
    setConnecting(true);
    try {
      await adapters.wallet.connectExternalWallet();
      router.replace("/(tabs)/home" as Parameters<typeof router.replace>[0]);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Couldn't connect wallet. Try again.";
      setConnectError(message);
    } finally {
      setConnecting(false);
    }
  }

  return (
    <View style={styles.root}>
      <Backdrop preset="home" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + theme.spacing.xxl,
            paddingBottom: insets.bottom + theme.spacing.xxl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroBlock}>
          <Animated.Text entering={reveal(0)} style={styles.headline}>
            Private by default.
          </Animated.Text>
          <Animated.Text entering={reveal(1)} style={styles.subheadline}>
            Payments and messages that work without the internet.
          </Animated.Text>
        </View>

        <View style={styles.features}>
          {FEATURES.map((f, index) => (
            <Animated.View
              key={f.iconName}
              entering={reveal(2 + index)}
              style={styles.featureCell}
            >
              <FeatureHighlight {...f} />
            </Animated.View>
          ))}
        </View>

        <View style={styles.spacer} />

        <View style={styles.actions}>
          <Animated.View entering={reveal(2 + FEATURES.length)} style={styles.ctaPrimary}>
            <DepthButton
              label="GET STARTED"
              variant="primary"
              tone="cyan"
              size="lg"
              onPress={() => router.push("/onboarding/setup")}
            />
          </Animated.View>
          <Animated.View entering={reveal(3 + FEATURES.length)} style={styles.ctaSecondary}>
            <DepthButton
              label={connecting ? "Connecting…" : "I have a wallet"}
              variant="secondary"
              tone="cyan"
              size="md"
              disabled={connecting}
              onPress={handleConnectExisting}
            />
          </Animated.View>
          {connectError ? (
            <Text style={styles.connectError}>{connectError}</Text>
          ) : null}
          <Animated.View entering={reveal(4 + FEATURES.length)}>
            <Pressable
              accessibilityLabel="Open technical overview"
              accessibilityRole="button"
              onPress={openTechSheet}
            >
              <Text style={styles.techLink}>Under the hood →</Text>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>

      <Sheet ref={techSheetRef} snapPoints={["85%"]} title="Under the hood">
        <View style={styles.sheetHeader}>
          <IconButton
            accessibilityLabel="Close technical overview"
            name="x"
            onPress={closeTechSheet}
            size="md"
            tone="neutral"
            variant="contained"
          />
        </View>
        <TechDrawerContent />
      </Sheet>
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
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.xl,
  },
  heroBlock: {
    gap: theme.spacing.md,
  },
  features: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  featureCell: {
    flex: 1,
  },
  spacer: {
    flexGrow: 1,
    minHeight: theme.spacing.lg,
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
  actions: {
    gap: theme.spacing.md,
    alignItems: "stretch",
  },
  ctaPrimary: {},
  ctaSecondary: {},
  techLink: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    letterSpacing: 0.3,
    textAlign: "center",
  },
  connectError: {
    color: theme.colors.red,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: 18,
    textAlign: "center",
  },
  sheetHeader: {
    alignItems: "flex-end",
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.sm,
  },
});
