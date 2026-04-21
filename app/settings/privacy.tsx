import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import {
  SettingsRow,
  SettingsScaffold,
  SettingsSection,
} from "@/components/settings";
import { usePreferences } from "@/src/hooks";
import type {
  PrivacyMode,
  RotationCadence,
} from "@/src/domain/services/PreferencesService";
import * as haptics from "@/src/design-system/haptics";
import * as sound from "@/src/design-system/sound";
import { appTheme as theme } from "@/src/design-system/theme";

const PRIVACY_MODES: PrivacyMode[] = ["Standard", "Enhanced", "Maximum"];
const ROTATION_CADENCES: RotationCadence[] = ["Weekly", "Monthly", "Never"];

export default function PrivacyScreen() {
  const router = useRouter();
  const { loading, privacy, updatePrivacy } = usePreferences();

  function handleStealthToggle(value: boolean) {
    void updatePrivacy({ stealthByDefault: value });
    haptics.select();
    if (value) sound.toggleOn(); else sound.toggleOff();
  }

  function cyclePrivacyMode() {
    const index = PRIVACY_MODES.indexOf(privacy.privacyMode);
    void updatePrivacy({ privacyMode: PRIVACY_MODES[(index + 1) % PRIVACY_MODES.length] });
    haptics.tap();
    sound.buttonTap();
  }

  function cycleRotationCadence() {
    const index = ROTATION_CADENCES.indexOf(privacy.rotationCadence);
    void updatePrivacy({ rotationCadence: ROTATION_CADENCES[(index + 1) % ROTATION_CADENCES.length] });
    haptics.tap();
    sound.buttonTap();
  }

  return (
    <SettingsScaffold
      eyebrow="Privacy defaults"
      onBack={() => router.back()}
      showBack
      subtitle="These preferences persist locally now and seed the send experience without pretending full stealth cryptography is already complete."
      title="Privacy & Stealth"
      tone="purple"
      trailing={<Pill label={privacy.stealthByDefault ? "Stealth default" : "Standard lane"} tone={privacy.stealthByDefault ? "purple" : "neutral"} />}
    >
      <GlassSurface variant="strong" style={styles.hero}>
        <View style={styles.traceRow}>
          <View style={styles.traceDot} />
          <View style={styles.traceLine} />
        </View>

        <View style={styles.heroTop}>
          <View style={styles.heroIconWrap}>
            <Icon color={theme.colors.purple} name="stealth" size={18} />
          </View>

          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Local defaults, staged privacy path.</Text>
            <Text style={styles.heroBody}>
              Save what the app should prefer by default. Full stealth settlement and rotation semantics still land later in backend truth pass.
            </Text>
          </View>
        </View>

        <View style={styles.heroPills}>
          <Pill label={privacy.privacyMode} tone="purple" />
          <Pill label={privacy.rotationCadence} tone="neutral" />
          <Pill label="Device-persisted" tone="green" />
        </View>
      </GlassSurface>

      <SettingsSection
        title="Stealth default"
        description="Seeds send-flow posture now. Does not claim finished end-to-end stealth routing or settlement."
      >
        <View style={styles.controlRow}>
          <View style={styles.controlIconWrap}>
            <Icon color={theme.colors.purple} name="stealth" size={18} />
          </View>

          <View style={styles.controlCopy}>
            <Text style={styles.controlLabel}>Stealth by default</Text>
            <Text style={styles.controlBody}>Prefer stealth-flavored send setup whenever that deeper path becomes available.</Text>
          </View>

          {loading ? (
            <ActivityIndicator color={theme.colors.purple} size="small" />
          ) : (
            <Switch
              onValueChange={handleStealthToggle}
              thumbColor={privacy.stealthByDefault ? theme.colors.purple : theme.colors.textMuted}
              trackColor={{ false: theme.colors.surfaceMuted, true: theme.colors.purpleGlowStrong }}
              value={privacy.stealthByDefault}
            />
          )}
        </View>
      </SettingsSection>

      <SettingsSection
        title="Transfer posture"
        description="Cycle local defaults instead of showing a dead segmented control. Keep interaction simple and truthful."
      >
        <SettingsRow
          iconName="lock-mesh"
          iconTone="purple"
          label="Transaction privacy mode"
          onPress={cyclePrivacyMode}
          pillLabel={privacy.privacyMode}
          pillTone="purple"
          sublabel="Tap to cycle the local privacy lane used by future transfers."
        />
        <SettingsRow
          iconName="refresh-cw"
          iconTone="neutral"
          label="Key rotation cadence"
          onPress={cycleRotationCadence}
          pillLabel={privacy.rotationCadence}
          pillTone="neutral"
          showSeparator={false}
          sublabel="Tap to cycle the local reminder cadence for future rotation work."
        />
      </SettingsSection>

      <GlassSurface variant="regular" style={styles.noteCard}>
        <Text style={styles.noteText}>
          Preferences save on this device now and feed nearby UI. They are not proof that stealth settlement, key rotation jobs, or confidential relay are complete on this branch.
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
    backgroundColor: theme.colors.purple,
    borderRadius: theme.radius.pill,
    height: 8,
    width: 8,
  },
  traceLine: {
    backgroundColor: theme.colors.purpleGlow,
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
    backgroundColor: theme.colors.purpleSoft,
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
  heroPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  controlRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    minHeight: 72,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  controlIconWrap: {
    alignItems: "center",
    backgroundColor: theme.colors.purpleSoft,
    borderRadius: theme.radius.pill,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  controlCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  controlLabel: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.bodyLg,
  },
  controlBody: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.45,
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
