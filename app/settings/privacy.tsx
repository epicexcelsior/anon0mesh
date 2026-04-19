import React, { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import * as haptics from "@/src/design-system/haptics";
import * as sound from "@/src/design-system/sound";
import { Backdrop } from "@/components/primitives/Backdrop";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Pill } from "@/components/primitives/Pill";
import { Icon } from "@/components/primitives/Icon";
import { SectionLabel } from "@/components/primitives/SectionLabel";
import { appTheme as theme } from "@/src/design-system/theme";

type PrivacyMode = "Standard" | "Enhanced" | "Maximum";
type RotationCadence = "Weekly" | "Monthly" | "Never";

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Local state — real persistence comes with Phase 5
  const [stealthByDefault, setStealthByDefault] = useState(false);
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>("Standard");
  const [rotationCadence, setRotationCadence] = useState<RotationCadence>("Monthly");

  const PRIVACY_MODES: PrivacyMode[] = ["Standard", "Enhanced", "Maximum"];
  const ROTATION_CADENCES: RotationCadence[] = ["Weekly", "Monthly", "Never"];

  function handleStealthToggle(value: boolean) {
    setStealthByDefault(value);
    haptics.select();
    if (value) sound.toggleOn(); else sound.toggleOff();
  }

  function cyclePrivacyMode() {
    const idx = PRIVACY_MODES.indexOf(privacyMode);
    setPrivacyMode(PRIVACY_MODES[(idx + 1) % PRIVACY_MODES.length]);
    haptics.tap();
    sound.buttonTap();
  }

  function cycleRotationCadence() {
    const idx = ROTATION_CADENCES.indexOf(rotationCadence);
    setRotationCadence(ROTATION_CADENCES[(idx + 1) % ROTATION_CADENCES.length]);
    haptics.tap();
    sound.buttonTap();
  }

  return (
    <View style={styles.root}>
      <Backdrop preset="settings" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
        <TouchableOpacity accessibilityLabel="Back" accessibilityRole="button" onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Icon name="arrow-left" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Stealth</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Stealth section */}
        <View style={styles.section}>
          <SectionLabel label="Stealth" />
          <GlassSurface variant="regular" style={styles.card}>
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Icon name="stealth" size={18} color={theme.colors.textSecondary} />
              </View>
              <View style={styles.rowMid}>
                <View style={styles.rowTitleRow}>
                  <Text style={styles.rowLabel}>Stealth by default</Text>
                  {stealthByDefault ? <Pill label="Stealth" tone="purple" /> : null}
                </View>
                <Text style={styles.rowSublabel}>
                  Transactions use stealth addresses by default
                </Text>
              </View>
              <Switch
                value={stealthByDefault}
                onValueChange={handleStealthToggle}
                trackColor={{ false: theme.colors.surfaceMuted, true: theme.colors.purpleSoft }}
                thumbColor={stealthByDefault ? theme.colors.purple : theme.colors.textMuted}
              />
            </View>
          </GlassSurface>
        </View>

        {/* Transaction Privacy section */}
        <View style={styles.section}>
          <SectionLabel label="Transaction Privacy" />
          <GlassSurface variant="regular" style={styles.card}>
            <TouchableOpacity
              accessibilityLabel={`Transaction privacy mode: ${privacyMode}. Tap to change.`}
              accessibilityRole="button"
              style={styles.row}
              onPress={cyclePrivacyMode}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrap}>
                <Icon name="lock-mesh" size={18} color={theme.colors.textSecondary} />
              </View>
              <View style={styles.rowMid}>
                <Text style={styles.rowLabel}>Transaction privacy mode</Text>
                <Text style={styles.rowSublabel}>Tap to cycle through modes</Text>
              </View>
              <View style={styles.rightWrap}>
                <Text style={styles.valueText}>{privacyMode}</Text>
                <Icon name="chevron-right" size={16} color={theme.colors.textMuted} />
              </View>
            </TouchableOpacity>
          </GlassSurface>
        </View>

        {/* Key Rotation section */}
        <View style={styles.section}>
          <SectionLabel label="Key Rotation" />
          <GlassSurface variant="regular" style={styles.card}>
            <TouchableOpacity
              accessibilityLabel={`Key rotation cadence: ${rotationCadence}. Tap to change.`}
              accessibilityRole="button"
              style={styles.row}
              onPress={cycleRotationCadence}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrap}>
                <Icon name="refresh-cw" size={18} color={theme.colors.textSecondary} />
              </View>
              <View style={styles.rowMid}>
                <Text style={styles.rowLabel}>Key rotation cadence</Text>
                <Text style={styles.rowSublabel}>Tap to cycle through options</Text>
              </View>
              <View style={styles.rightWrap}>
                <Text style={styles.valueText}>{rotationCadence}</Text>
                <Icon name="chevron-right" size={16} color={theme.colors.textMuted} />
              </View>
            </TouchableOpacity>
          </GlassSurface>
        </View>

        {/* Note */}
        <Text style={styles.footerNote}>
          All privacy settings are local and will sync with backend in a future release.
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
  card: {
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    minHeight: 60,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  iconWrap: {
    alignItems: "center",
    flexShrink: 0,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  rowMid: {
    flex: 1,
    gap: theme.spacing.xxs,
  },
  rowTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  rowLabel: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
  },
  rowSublabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
  rightWrap: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    gap: theme.spacing.xs,
  },
  valueText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
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
