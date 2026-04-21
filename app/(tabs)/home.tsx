import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BalanceCard } from "@/components/home/BalanceCard";
import { HistoryList } from "@/components/home/HistoryList";
import { HomeHero } from "@/components/home/HomeHero";
import { RecentActivity } from "@/components/home/RecentActivity";
import { Backdrop } from "@/components/primitives/Backdrop";
import { Icon } from "@/components/primitives/Icon";
import { SegmentedControl } from "@/components/primitives/SegmentedControl";
import { appTheme as theme } from "@/src/design-system/theme";
import { useTransaction } from "@/src/hooks";

const SEGMENTS = [
  { id: "balance", label: "Balance" },
  { id: "history", label: "History" },
];

const ACTIONS = [
  {
    id: "send",
    label: "Send",
    detail: "Pay peer or address",
    icon: "send" as const,
    tone: "accent" as const,
    route: "/send/recipient" as const,
  },
  {
    id: "receive",
    label: "Receive",
    detail: "Show wallet QR",
    icon: "download" as const,
    tone: "neutral" as const,
    route: "/receive" as const,
  },
  {
    id: "history",
    label: "History",
    detail: "Open full ledger",
    icon: "clock" as const,
    tone: "neutral" as const,
    route: "/history" as const,
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [segment, setSegment] = useState("balance");
  const { transactions } = useTransaction();

  return (
    <View style={styles.root}>
      <Backdrop preset="home" animated />

      <View style={[styles.content, { paddingTop: insets.top + theme.spacing.md }]}>
        <HomeHero />
        <BalanceCard />

        <View style={styles.actionRow}>
          {ACTIONS.map((action) => {
            const accent = action.tone === "accent";
            return (
              <TouchableOpacity
                key={action.id}
                accessibilityLabel={action.label}
                accessibilityRole="button"
                activeOpacity={0.8}
                onPress={() => router.push(action.route)}
                style={[styles.actionCard, accent && styles.actionCardAccent]}
              >
                <View style={[styles.actionIconWrap, accent && styles.actionIconWrapAccent]}>
                  <Icon
                    name={action.icon}
                    size={18}
                    color={accent ? theme.colors.textOnAccent : theme.colors.cyan}
                  />
                </View>
                <Text style={[styles.actionLabel, accent && styles.actionLabelAccent]}>
                  {action.label}
                </Text>
                <Text style={[styles.actionDetail, accent && styles.actionDetailAccent]}>
                  {action.detail}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.segmentRow}>
          <SegmentedControl segments={SEGMENTS} selected={segment} onSelect={setSegment} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {segment === "balance" ? "Recent activity" : "Transfer history"}
          </Text>
          <Text style={styles.sectionMeta}>
            {segment === "balance"
              ? "Queued, mesh handoff, and settled states update live."
              : "Tap any transfer for its live receipt state."}
          </Text>
        </View>

        {segment === "balance" ? (
          <RecentActivity />
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
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  actionCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flex: 1,
    gap: theme.spacing.sm,
    minHeight: 112,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  actionCardAccent: {
    backgroundColor: theme.colors.cyan,
    borderColor: theme.colors.cyan,
  },
  actionIconWrap: {
    alignItems: "center",
    backgroundColor: theme.colors.cyanSoft,
    borderRadius: theme.radius.pill,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  actionIconWrapAccent: {
    backgroundColor: "rgba(5, 10, 10, 0.12)",
  },
  actionLabel: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.body,
  },
  actionLabelAccent: {
    color: theme.colors.textOnAccent,
  },
  actionDetail: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.45,
  },
  actionDetailAccent: {
    color: "rgba(5, 10, 10, 0.72)",
  },
  segmentRow: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  sectionHeader: {
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.section,
  },
  sectionMeta: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.5,
  },
});
