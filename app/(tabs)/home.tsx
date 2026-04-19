import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any;

import { Backdrop } from "@/components/primitives/Backdrop";
import { SegmentedControl } from "@/components/primitives/SegmentedControl";
import { Icon } from "@/components/primitives/Icon";
import { BalanceCard } from "@/components/home/BalanceCard";
import { HistoryList } from "@/components/home/HistoryList";
import { HomeHero } from "@/components/home/HomeHero";
import { RecentActivity } from "@/components/home/RecentActivity";
import { useTransaction } from "@/src/hooks";
import { appTheme as theme } from "@/src/design-system/theme";

const SEGMENTS = [
  { id: "balance", label: "Balance" },
  { id: "history", label: "History" },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [segment, setSegment] = useState("balance");
  const { transactions } = useTransaction();

  return (
    <View style={styles.root}>
      <Backdrop preset="home" />

      <View style={[styles.content, { paddingTop: insets.top + theme.spacing.sm }]}>
        {/* Identity chip row + QR icon */}
        <HomeHero />

        {/* Balance card */}
        <BalanceCard />

        {/* Action row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            accessibilityLabel="Send"
            accessibilityRole="button"
            style={styles.actionButton}
            onPress={() => router.push("/send/recipient" as AnyHref)}
            activeOpacity={0.75}
          >
            <View style={[styles.actionIcon, styles.actionIconCyan]}>
              <Icon name="send" size={16} color={theme.colors.cyan} />
            </View>
            <Text style={styles.actionLabel}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="Receive"
            accessibilityRole="button"
            style={styles.actionButton}
            onPress={() => router.push("/receive" as AnyHref)}
            activeOpacity={0.75}
          >
            <View style={[styles.actionIcon, styles.actionIconGreen]}>
              <Icon name="download" size={16} color={theme.colors.green} />
            </View>
            <Text style={styles.actionLabel}>Receive</Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="History"
            accessibilityRole="button"
            style={styles.actionButton}
            onPress={() => router.push("/history" as AnyHref)}
            activeOpacity={0.75}
          >
            <View style={[styles.actionIcon, styles.actionIconNeutral]}>
              <Icon name="clock" size={16} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.actionLabel}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Segment toggle */}
        <View style={styles.segmentRow}>
          <SegmentedControl
            segments={SEGMENTS}
            selected={segment}
            onSelect={setSegment}
          />
        </View>

        {/* Content area */}
        {segment === "balance" ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
            </View>
            <RecentActivity />
          </>
        ) : (
          <HistoryList transactions={transactions} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "center",
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  actionButton: {
    alignItems: "center",
    flex: 1,
    gap: theme.spacing.xs,
  },
  actionIcon: {
    alignItems: "center",
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  actionIconCyan: {
    backgroundColor: theme.colors.cyanSoft,
    borderColor: theme.colors.cyanSoft,
  },
  actionIconGreen: {
    backgroundColor: theme.colors.greenSoft,
    borderColor: theme.colors.greenSoft,
  },
  actionIconNeutral: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.line,
  },
  actionLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
  },
  segmentRow: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
