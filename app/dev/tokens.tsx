// Read-only token + primitive swatch preview. __DEV__ only.
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import BottomSheet from "@gorhom/bottom-sheet";
import { useRef } from "react";

import { DepthButton } from "@/components/primitives/DepthButton";
import { IconButton } from "@/components/primitives/IconButton";
import {
  Pill,
  PressSurface,
  SegmentedControl,
  Sheet,
  SlideToConfirm,
} from "@/components/primitives";
import * as haptics from "@/src/design-system/haptics";
import { foundationTokens } from "@/src/design-system/tokens";
import { appTheme as theme } from "@/src/design-system/theme";

type Swatch = { name: string; value: string };

const COLOR_GROUPS: { title: string; entries: Swatch[] }[] = [
  {
    title: "Surface",
    entries: [
      { name: "background", value: theme.colors.background },
      { name: "surface", value: theme.colors.surface },
      { name: "surfaceMuted", value: theme.colors.surfaceMuted },
      { name: "surfaceElevated", value: theme.colors.surfaceElevated },
      { name: "surfaceContainerHigh", value: theme.colors.surfaceContainerHigh },
    ],
  },
  {
    title: "Text",
    entries: [
      { name: "textPrimary", value: theme.colors.textPrimary },
      { name: "textSecondary", value: theme.colors.textSecondary },
      { name: "textTertiary", value: theme.colors.textTertiary },
      { name: "textMuted", value: theme.colors.textMuted },
    ],
  },
  {
    title: "Accents",
    entries: [
      { name: "cyan", value: theme.colors.cyan },
      { name: "green", value: theme.colors.green },
      { name: "amber", value: theme.colors.amber },
      { name: "red", value: theme.colors.red },
      { name: "purple", value: theme.colors.purple },
    ],
  },
];

const HAPTIC_TIERS: { label: string; fire: () => void }[] = [
  { label: "tap", fire: haptics.tap },
  { label: "select", fire: haptics.select },
  { label: "lightPress", fire: haptics.lightPress },
  { label: "mediumPress", fire: haptics.mediumPress },
  { label: "confirm", fire: haptics.confirm },
  { label: "warning", fire: haptics.warning },
  { label: "error", fire: haptics.error },
  { label: "dragCross", fire: haptics.dragCross },
  { label: "releaseHeavy", fire: haptics.releaseHeavy },
];

const SEGMENTS = [
  { id: "balance", label: "Balance" },
  { id: "history", label: "History" },
];

export default function TokensPreview() {
  if (!__DEV__) return null;
  const sheetRef = useRef<BottomSheet>(null);
  const [segment, setSegment] = useState<string>("balance");

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Token & Primitive Preview</Text>
      <Text style={styles.subtitle}>
        Read-only. Edit tokens in src/design-system/tokens/* — Metro Fast Refresh
        re-renders immediately.
      </Text>

      {/* COLORS */}
      <Section title="Colors">
        {COLOR_GROUPS.map((group) => (
          <View key={group.title} style={styles.groupBlock}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.swatchRow}>
              {group.entries.map((s) => (
                <View key={s.name} style={styles.swatch}>
                  <View style={[styles.swatchChip, { backgroundColor: s.value }]} />
                  <Text style={styles.swatchName}>{s.name}</Text>
                  <Text style={styles.swatchValue}>{s.value}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </Section>

      {/* TYPOGRAPHY */}
      <Section title="Typography">
        {Object.entries(foundationTokens.type).map(([name, size]) => (
          <View key={name} style={styles.typeRow}>
            <Text style={[styles.typeLabel, { fontSize: size }]}>{name}</Text>
            <Text style={styles.typeMeta}>{size}px</Text>
          </View>
        ))}
      </Section>

      {/* SPACING */}
      <Section title="Spacing">
        {Object.entries(foundationTokens.spacing).map(([name, px]) => (
          <View key={name} style={styles.rulerRow}>
            <Text style={styles.rulerLabel}>{name}</Text>
            <View style={[styles.rulerBar, { width: px as number }]} />
            <Text style={styles.rulerValue}>{px as number}px</Text>
          </View>
        ))}
      </Section>

      {/* RADIUS */}
      <Section title="Radius">
        <View style={styles.radiusRow}>
          {Object.entries(foundationTokens.radius).map(([name, px]) => (
            <View key={name} style={styles.radiusCell}>
              <View
                style={[
                  styles.radiusChip,
                  {
                    borderRadius: px as number,
                    backgroundColor: theme.colors.cyanSoft,
                    borderColor: theme.colors.cyanBorderSoft,
                  },
                ]}
              />
              <Text style={styles.swatchName}>{name}</Text>
              <Text style={styles.swatchValue}>{px as number}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* DEPTH BUTTON */}
      <Section title="DepthButton">
        <View style={styles.stack}>
          <DepthButton label="Primary cyan lg" variant="primary" tone="cyan" size="lg" />
          <DepthButton label="Primary green md" variant="primary" tone="green" size="md" />
          <DepthButton label="Primary purple sm" variant="primary" tone="purple" size="sm" />
          <DepthButton label="Secondary" variant="secondary" size="md" />
          <DepthButton label="Success" variant="success" size="md" />
          <DepthButton label="Danger" variant="danger" size="md" />
          <DepthButton label="Ghost cyan" variant="ghost" tone="cyan" size="md" />
          <DepthButton label="Disabled" variant="primary" tone="cyan" size="md" disabled />
        </View>
      </Section>

      {/* ICON BUTTON */}
      <Section title="IconButton">
        <Text style={styles.hint}>Tap to feel the press. Haptic fires on press-IN.</Text>
        <View style={styles.iconRow}>
          <IconButton name="x" accessibilityLabel="close" />
          <IconButton name="arrow-left" accessibilityLabel="back" />
          <IconButton name="chevron-right" accessibilityLabel="next" />
          <IconButton name="copy" accessibilityLabel="copy" tone="cyan" />
          <IconButton name="share-2" accessibilityLabel="share" tone="green" variant="contained" />
          <IconButton name="alert-triangle" accessibilityLabel="warning" tone="amber" variant="contained" />
          <IconButton name="trash-2" accessibilityLabel="delete" tone="red" variant="contained" />
        </View>
        <View style={styles.iconRow}>
          <IconButton name="plus" accessibilityLabel="plus sm" size="sm" />
          <IconButton name="plus" accessibilityLabel="plus md" size="md" />
          <IconButton name="plus" accessibilityLabel="plus lg" size="lg" />
        </View>
      </Section>

      {/* PRESS SURFACE */}
      <Section title="PressSurface">
        <Text style={styles.hint}>Row / strip / card variants. Tap to feel each.</Text>
        <PressSurface variant="row" onPress={() => undefined} style={styles.demoSurface}>
          <View style={styles.rowDemoInner}>
            <Text style={styles.rowDemoTitle}>Row variant</Text>
            <Text style={styles.rowDemoSub}>List items, peer rows, conversation rows</Text>
          </View>
        </PressSurface>
        <PressSurface variant="strip" onPress={() => undefined} style={styles.demoStrip}>
          <View style={styles.stripDemoInner}>
            <Text style={styles.stripDemoText}>Strip variant — mesh status / notice bands</Text>
          </View>
        </PressSurface>
        <PressSurface variant="card" onPress={() => undefined} style={styles.demoCard}>
          <View style={styles.cardDemoInner}>
            <Text style={styles.rowDemoTitle}>Card variant</Text>
            <Text style={styles.rowDemoSub}>Elevated tappable cards. Shadow drops on press.</Text>
          </View>
        </PressSurface>
      </Section>

      {/* SEGMENTED / PILL / SLIDE */}
      <Section title="Segmented · Pill · Slide">
        <SegmentedControl
          onSelect={setSegment}
          segments={SEGMENTS}
          selected={segment}
        />
        <View style={styles.pillRow}>
          <Pill label="Live" tone="cyan" />
          <Pill label="Silent" tone="amber" />
          <Pill label="Offline" tone="neutral" />
          <Pill label="Settled" tone="green" />
          <Pill label="Error" tone="red" />
        </View>
        <SlideToConfirm
          label="Slide to confirm"
          onComplete={() => haptics.confirm()}
        />
      </Section>

      {/* SHEET */}
      <Section title="Sheet">
        <DepthButton
          label="Open sheet"
          variant="secondary"
          size="md"
          onPress={() => sheetRef.current?.expand()}
        />
      </Section>

      {/* HAPTIC TESTER */}
      <Section title="Haptic tester">
        <Text style={styles.hint}>Feel the difference between tiers.</Text>
        <View style={styles.hapticGrid}>
          {HAPTIC_TIERS.map((t) => (
            <View key={t.label} style={styles.hapticCell}>
              <DepthButton
                label={t.label}
                variant="secondary"
                size="sm"
                onPress={t.fire}
              />
            </View>
          ))}
        </View>
      </Section>

      <View style={styles.footer} />

      <Sheet ref={sheetRef} snapPoints={[320]} title="Sheet preview">
        <View style={styles.sheetBody}>
          <Text style={styles.rowDemoSub}>
            Sheet primitive — spring-animated entry, backdrop dismiss, safe-area padded.
            Opens via ref (gorhom BottomSheet).
          </Text>
          <DepthButton
            label="Close"
            variant="secondary"
            size="md"
            onPress={() => sheetRef.current?.close()}
          />
        </View>
      </Sheet>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.lg },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.title,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    marginBottom: theme.spacing.sm,
  },
  section: {
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.section,
  },
  groupBlock: { gap: theme.spacing.xs },
  groupTitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
  },
  swatchRow: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  swatch: { width: 86, gap: 2 },
  swatchChip: {
    height: 36,
    width: "100%",
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  swatchName: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.micro,
  },
  swatchValue: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.mono,
    fontSize: theme.type.micro,
  },
  typeRow: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  typeLabel: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
  },
  typeMeta: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.mono,
    fontSize: theme.type.micro,
  },
  rulerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  rulerLabel: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    width: 52,
  },
  rulerBar: {
    backgroundColor: theme.colors.cyan,
    height: 10,
    borderRadius: 2,
  },
  rulerValue: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.mono,
    fontSize: theme.type.micro,
  },
  radiusRow: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.md },
  radiusCell: { alignItems: "center", gap: 2, width: 72 },
  radiusChip: {
    width: 48,
    height: 48,
    borderWidth: 1,
  },
  stack: { gap: theme.spacing.sm },
  hint: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
  iconRow: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm, alignItems: "center" },
  demoSurface: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  rowDemoInner: { padding: theme.spacing.md, gap: 2 },
  rowDemoTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  rowDemoSub: {
    color: theme.colors.textTertiary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
  demoStrip: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  stripDemoInner: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm },
  stripDemoText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
  demoCard: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  cardDemoInner: { padding: theme.spacing.lg, gap: 2 },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs },
  sheetBody: { gap: theme.spacing.md },
  hapticGrid: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs },
  hapticCell: { flexGrow: 1, minWidth: 100 },
  footer: { height: theme.spacing.huge },
});
