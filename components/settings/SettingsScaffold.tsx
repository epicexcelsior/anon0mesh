import React from "react";
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Backdrop } from "@/components/primitives/Backdrop";
import { Icon } from "@/components/primitives/Icon";
import { appTheme as theme } from "@/src/design-system/theme";

type AccentTone = "purple" | "cyan" | "amber" | "green";

const TONE_ACCENT: Record<AccentTone, string> = {
  purple: theme.colors.purple,
  cyan: theme.colors.cyan,
  amber: theme.colors.amber,
  green: theme.colors.green,
};

const TONE_GLOW: Record<AccentTone, string> = {
  purple: theme.colors.purpleGlow,
  cyan: theme.colors.cyanGlow,
  amber: theme.colors.amberGlow,
  green: theme.colors.greenGlow,
};

interface SettingsScaffoldProps {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  eyebrow?: string;
  footer?: React.ReactNode;
  onBack?: () => void;
  showBack?: boolean;
  subtitle?: string;
  title: string;
  tone?: AccentTone;
  trailing?: React.ReactNode;
}

export function SettingsScaffold({
  children,
  contentContainerStyle,
  eyebrow = "Control plane",
  footer,
  onBack,
  showBack = false,
  subtitle,
  title,
  tone = "purple",
  trailing,
}: SettingsScaffoldProps) {
  const accent = TONE_ACCENT[tone];
  const glow = TONE_GLOW[tone];

  return (
    <View style={styles.root}>
      <Backdrop animated preset="settings" />

      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <View style={styles.header}>
          {showBack ? (
            <TouchableOpacity
              accessibilityLabel="Back"
              accessibilityRole="button"
              activeOpacity={0.8}
              hitSlop={8}
              onPress={onBack}
              style={styles.navButton}
            >
              <Icon color={theme.colors.textPrimary} name="arrow-left" size={18} />
            </TouchableOpacity>
          ) : (
            <View style={styles.navSpacer} />
          )}

          {trailing ?? <View style={styles.navSpacer} />}
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <View style={styles.intro}>
            <View style={styles.traceRow}>
              <View style={[styles.traceDot, { backgroundColor: accent }]} />
              <View style={[styles.traceLine, { backgroundColor: glow }]} />
            </View>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>

          {children}

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
  },
  navButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  navSpacer: {
    height: 40,
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  intro: {
    gap: theme.spacing.xs,
  },
  traceRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  traceDot: {
    borderRadius: theme.radius.pill,
    height: 8,
    width: 8,
  },
  traceLine: {
    borderRadius: theme.radius.pill,
    height: 1,
    width: 88,
  },
  eyebrow: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.display,
    fontSize: theme.type.title,
    letterSpacing: -0.8,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
    lineHeight: theme.type.body * 1.55,
    maxWidth: 360,
    paddingTop: theme.spacing.xs,
  },
  footer: {
    paddingTop: theme.spacing.sm,
  },
});
