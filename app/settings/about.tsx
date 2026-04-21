import Constants from "expo-constants";
import React from "react";
import { Alert, Image, Linking, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Pill } from "@/components/primitives/Pill";
import {
  SettingsRow,
  SettingsScaffold,
  SettingsSection,
} from "@/components/settings";
import { appTheme as theme } from "@/src/design-system/theme";

const REPO_URL = "https://github.com/epicexcelsior/anon0mesh";
const LICENSE_URL = "https://github.com/epicexcelsior/anon0mesh/blob/main/LICENSE";

export default function AboutScreen() {
  const router = useRouter();
  const version = Constants.expoConfig?.version ?? "dev";

  async function openExternal(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Link unavailable", url);
    }
  }

  return (
    <SettingsScaffold
      eyebrow="Runtime truth"
      onBack={() => router.back()}
      showBack
      subtitle="Keep version, links, and technology language aligned with what this branch actually ships today."
      title="About"
      tone="green"
      trailing={<Pill label={`v${version}`} tone="green" />}
    >
      <GlassSurface variant="strong" style={styles.hero}>
        <View style={styles.traceRow}>
          <View style={styles.traceDot} />
          <View style={styles.traceLine} />
        </View>

        <Image
          resizeMode="contain"
          source={require("@/assets/brand/anonmesh-logo.png")}
          style={styles.logo}
        />

        <Text style={styles.appName}>AnonMesh</Text>
        <Text style={styles.laneLabel}>v3-full recovery lane</Text>
        <Text style={styles.heroBody}>
          Design canon comes from the Void Protocol redesign lane. Product truth comes from `docs/v3-full/` and the live seams currently wired in this branch.
        </Text>

        <View style={styles.heroPills}>
          <Pill label="BLE live" tone="green" />
          <Pill label="On-chain send" tone="cyan" />
          <Pill label="Core screens rebuilt" tone="neutral" />
        </View>
      </GlassSurface>

      <SettingsSection
        title="Runtime truth"
        description="Split what is solid today from what is still staged, so the screen remains honest even after the visual polish pass."
      >
        <View style={styles.runtimeStack}>
          <GlassSurface variant="regular" style={styles.runtimeCard}>
            <Text style={styles.runtimeTitle}>Live now</Text>
            <Text style={styles.runtimeBody}>
              BLE peer discovery, wallet/send/history seams, on-chain transfer flow, and the rebuilt Home, Send, Messages, Peers, and Settings surfaces.
            </Text>
          </GlassSurface>

          <GlassSurface variant="regular" style={styles.runtimeCard}>
            <Text style={styles.runtimeTitle}>Staged next</Text>
            <Text style={styles.runtimeBody}>
              LXMF runtime, full stealth settlement path, beacon staking, and deeper relay or routing intelligence beyond direct BLE discovery.
            </Text>
          </GlassSurface>
        </View>
      </SettingsSection>

      <SettingsSection
        title="Links"
        description="Source and license entry points. Prefer real links over placeholder alerts here."
      >
        <SettingsRow
          iconName="github"
          iconTone="green"
          label="GitHub repository"
          onPress={() => {
            void openExternal(REPO_URL);
          }}
          sublabel="Open the anon0mesh source repository"
          value="Open"
        />
        <SettingsRow
          iconName="file-text"
          iconTone="neutral"
          label="License"
          onPress={() => {
            void openExternal(LICENSE_URL);
          }}
          showSeparator={false}
          sublabel="View the current repository license"
          value="Open"
        />
      </SettingsSection>

      <GlassSurface variant="regular" style={styles.footerCard}>
        <Text style={styles.footerText}>
          Private mesh payments on Solana, rebuilt in one token lane and one visual grammar. Docs stay source of truth while backend catches up.
        </Text>
      </GlassSurface>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    borderRadius: theme.radius.xl,
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  traceRow: {
    alignItems: "center",
    alignSelf: "stretch",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  traceDot: {
    backgroundColor: theme.colors.green,
    borderRadius: theme.radius.pill,
    height: 8,
    width: 8,
  },
  traceLine: {
    backgroundColor: theme.colors.greenGlow,
    borderRadius: theme.radius.pill,
    height: 1,
    width: 88,
  },
  logo: {
    height: 72,
    width: 72,
  },
  appName: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.display,
    fontSize: theme.type.section,
    letterSpacing: -0.5,
  },
  laneLabel: {
    color: theme.colors.green,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  heroBody: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
    lineHeight: theme.type.body * 1.55,
    textAlign: "center",
  },
  heroPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    justifyContent: "center",
  },
  runtimeStack: {
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  runtimeCard: {
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  runtimeTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.bodyLg,
  },
  runtimeBody: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.55,
  },
  footerCard: {
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.6,
  },
});
