import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Backdrop } from "@/components/primitives/Backdrop";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { DepthButton } from "@/components/primitives/DepthButton";
import { Pill } from "@/components/primitives/Pill";
import { Icon } from "@/components/primitives/Icon";
import { SectionLabel } from "@/components/primitives/SectionLabel";
import { useBeacon } from "@/src/hooks/useBeacon";
import { appTheme as theme } from "@/src/design-system/theme";

function modePillTone(mode: string): "green" | "amber" | "neutral" {
  if (mode === "active") return "green";
  if (mode === "passive") return "amber";
  return "neutral";
}

export default function BeaconScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { mode } = useBeacon();

  function handleStake() {
    Alert.alert(
      "Coming Soon",
      "Beacon staking — backend integration pending.",
      [{ text: "OK" }]
    );
  }

  return (
    <View style={styles.root}>
      <Backdrop preset="settings" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Icon name="arrow-left" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Beacon Node</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status card */}
        <View style={styles.section}>
          <SectionLabel label="Status" />
          <GlassSurface variant="strong" style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={styles.beaconIconWrap}>
                <Icon name="beacon" size={28} color={theme.colors.amber} />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>Beacon Status</Text>
                <Pill
                  label={mode.charAt(0).toUpperCase() + mode.slice(1)}
                  tone={modePillTone(mode)}
                />
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>0 SOL</Text>
                <Text style={styles.statLabel}>Staked</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>0 SOL</Text>
                <Text style={styles.statLabel}>Earned</Text>
              </View>
            </View>
          </GlassSurface>
        </View>

        {/* Become a beacon section */}
        <View style={styles.section}>
          <SectionLabel label="Become a Beacon" />
          <GlassSurface variant="regular" style={styles.becomeCard}>
            <Text style={styles.becomeDescription}>
              Stake SOL to co-sign confidential transactions and earn fees as a beacon node.
            </Text>
            <DepthButton
              label="Stake to Become a Beacon"
              tone="amber"
              onPress={handleStake}
              icon={<Icon name="anchor" size={16} color={theme.colors.textOnAccent} />}
              style={styles.stakeButton}
            />
          </GlassSurface>
        </View>

        {/* Footer note */}
        <Text style={styles.footerNote}>
          Beacon staking requires the beacon smart contract to be deployed. Coming in a future release.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  backBtn: {
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.section,
    textAlign: "center",
  },
  headerSpacer: {
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  section: {
    gap: theme.spacing.xs,
  },
  statusCard: {
    borderRadius: theme.radius.md,
    gap: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  statusHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  beaconIconWrap: {
    alignItems: "center",
    backgroundColor: theme.colors.amberSoft,
    borderRadius: theme.radius.pill,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  statusInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  statusTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.section,
  },
  statsRow: {
    flexDirection: "row",
    gap: theme.spacing.lg,
  },
  stat: {
    alignItems: "center",
    flex: 1,
    gap: theme.spacing.xxs,
  },
  statValue: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.bodyLg,
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  statDivider: {
    backgroundColor: theme.colors.line,
    width: StyleSheet.hairlineWidth,
  },
  becomeCard: {
    borderRadius: theme.radius.md,
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  becomeDescription: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
    lineHeight: theme.type.body * 1.5,
  },
  stakeButton: {
    // width inherited from parent flex
  },
  footerNote: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.6,
    paddingHorizontal: theme.spacing.xs,
    textAlign: "center",
  },
});
