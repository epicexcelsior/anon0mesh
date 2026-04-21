import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { DepthButton } from "@/components/primitives/DepthButton";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import {
  SettingsRow,
  SettingsScaffold,
  SettingsSection,
} from "@/components/settings";
import { useBeacon } from "@/src/hooks";
import { appTheme as theme } from "@/src/design-system/theme";

function modeTone(mode: string) {
  if (mode === "active") return "green" as const;
  if (mode === "passive") return "amber" as const;
  return "neutral" as const;
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function BeaconScreen() {
  const router = useRouter();
  const { advertising, mode } = useBeacon();

  function handleStakePreview() {
    Alert.alert(
      "Beacon staking not live yet",
      "This screen is honest preview UI only. Contract deployment and settlement wiring land in a later phase.",
    );
  }

  return (
    <SettingsScaffold
      eyebrow="Beacon registry"
      onBack={() => router.back()}
      showBack
      subtitle="Beacon economics and staking are still placeholder work. This surface keeps the role visible without pretending funds can move yet."
      title="Beacon Node"
      tone="amber"
      trailing={<Pill label={titleCase(mode)} tone={modeTone(mode)} />}
    >
      <GlassSurface variant="strong" style={styles.hero}>
        <View style={styles.traceRow}>
          <View style={styles.traceDot} />
          <View style={styles.traceLine} />
        </View>

        <View style={styles.heroTop}>
          <View style={styles.heroIconWrap}>
            <Icon color={theme.colors.amber} name="beacon" size={18} />
          </View>

          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Beacon role stays preview-only.</Text>
            <Text style={styles.heroBody}>
              Use this lane to shape the future staking and co-signing surface without implying that the beacon contract or earnings path are live on this branch.
            </Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Staked</Text>
            <Text style={styles.metricValue}>0 SOL</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Earned</Text>
            <Text style={styles.metricValue}>0 SOL</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Advertise</Text>
            <Text style={styles.metricValue}>{advertising ? "On" : "Off"}</Text>
          </View>
        </View>
      </GlassSurface>

      <SettingsSection
        title="Role state"
        description="Show what the current beacon seam knows today: mode and whether local advertising is active."
      >
        <SettingsRow
          iconName="beacon"
          iconTone="amber"
          label="Current mode"
          pillLabel={titleCase(mode)}
          pillTone={modeTone(mode)}
          sublabel="Placeholder runtime role surfaced from the current beacon hook."
        />
        <SettingsRow
          iconName="radio"
          iconTone="neutral"
          label="Advertising"
          showSeparator={false}
          sublabel="Local advertising flag only. No live stake-backed routing implied."
          value={advertising ? "Enabled" : "Disabled"}
        />
      </SettingsSection>

      <SettingsSection
        title="Stake preview"
        description="Reserve the interaction shape now, but keep the action clearly non-financial until backend work exists."
      >
        <View style={styles.ctaBlock}>
          <Text style={styles.ctaBody}>
            Future beacon nodes will stake SOL to co-sign confidential flows and earn fees. This branch only previews that role and terminology.
          </Text>

          <DepthButton
            icon={<Icon color={theme.colors.textOnAccent} name="anchor" size={16} />}
            label="Preview staking flow"
            onPress={handleStakePreview}
            size="md"
            tone="amber"
          />
        </View>
      </SettingsSection>

      <GlassSurface variant="regular" style={styles.noteCard}>
        <Text style={styles.noteText}>
          No stake transaction fires from this screen. Beacon mode, rewards, and smart-contract settlement all remain staged work for the next recovery phase.
        </Text>
      </GlassSurface>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: theme.radius.xl,
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  traceRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  traceDot: {
    backgroundColor: theme.colors.amber,
    borderRadius: theme.radius.pill,
    height: 8,
    width: 8,
  },
  traceLine: {
    backgroundColor: theme.colors.amberGlow,
    borderRadius: theme.radius.pill,
    height: 1,
    width: 88,
  },
  heroTop: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  heroIconWrap: {
    alignItems: "center",
    backgroundColor: theme.colors.amberSoft,
    borderRadius: theme.radius.pill,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  heroCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  heroTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.section,
  },
  heroBody: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
    lineHeight: theme.type.body * 1.55,
  },
  metricRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  metricCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.lineStrong,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flex: 1,
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  metricLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  metricValue: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.bodyLg,
  },
  ctaBlock: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  ctaBody: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
    lineHeight: theme.type.body * 1.55,
  },
  noteCard: {
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  noteText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.6,
  },
});
