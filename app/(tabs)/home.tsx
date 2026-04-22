import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActionRow } from "@/components/home/ActionRow";
import { BalanceCard } from "@/components/home/BalanceCard";
import { HomeHero } from "@/components/home/HomeHero";
import { NearbyPeersCard } from "@/components/home/NearbyPeersCard";
import { RecentActivity } from "@/components/home/RecentActivity";
import { Backdrop } from "@/components/primitives/Backdrop";
import { appTheme as theme } from "@/src/design-system/theme";
import * as haptics from "@/src/design-system/haptics";
import { HideBalanceProvider } from "@/src/hooks/useHideBalance";
import { useTransaction, useWallet } from "@/src/hooks";

const RECENT_LIMIT = 5;

export default function HomeScreen() {
  return (
    <HideBalanceProvider>
      <HomeSurface />
    </HideBalanceProvider>
  );
}

function HomeSurface() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { wallet, loading } = useWallet();
  const { recent } = useTransaction();

  const hasMoreActivity = recent.length > RECENT_LIMIT;

  function openHistory() {
    haptics.select();
    router.push("/history" as Parameters<typeof router.push>[0]);
  }

  return (
    <View style={styles.root}>
      <Backdrop preset="home" animated />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + theme.spacing.sm,
            paddingBottom: theme.component.nav.barHeight + theme.spacing.xxxl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <HomeHero wallet={wallet} />
        <BalanceCard loading={loading} wallet={wallet} />
        <ActionRow />
        <NearbyPeersCard />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent</Text>
        </View>

        <View style={styles.activityWrap}>
          <RecentActivity limit={RECENT_LIMIT} />
        </View>

        {hasMoreActivity ? (
          <Pressable
            accessibilityLabel="See all transactions"
            accessibilityRole="button"
            onPress={openHistory}
            style={styles.seeAll}
          >
            <Text style={styles.seeAllText}>See all →</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    gap: theme.spacing.sm,
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xs,
  },
  sectionTitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  activityWrap: {
    paddingHorizontal: theme.spacing.lg,
  },
  seeAll: {
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  seeAllText: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
});
